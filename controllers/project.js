const axios = require('axios');
const Project = require('../models/project');
const WorkItems = require('../models/workItems');
var cron = require('node-cron');

// Getting project list & saving into db
  cron.schedule('* * * * *', async () => { 

  const organization = process.env.ORGANIZATION;
  const pat = process.env.ACCESS_TOKEN;


  try {
    const response = await axios.get(`https://dev.azure.com/${organization}/_apis/projects?api-version=7.1`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
      },
    });
 
    const projects = response.data.value;

     projectsData = JSON.stringify(projects);

    //   let project = await Project.findOneAndUpdate(
    //   { organizationName: process.env.ORGANIZATION },
    //   { $setOnInsert: { organizationName: process.env.ORGANIZATION, projects: projectsData } },
    //   { upsert: true, new: true, rawResult: true }
    // );
      

    const ProjectSave = new Project({ organizationName: process.env.ORGANIZATION, projects: projectsData  });
    await ProjectSave.save();

    console.log("project running");

  } catch (error) {
    next(error);
  }
});


// getting work items list and saving into db
cron.schedule('* * * * *', async () => { 

  const organizationName = process.env.ORGANIZATION;
  const pat = process.env.ACCESS_TOKEN;
      

  const projectList = await Project.findOne({ organizationName }).sort({_id:-1}).limit(1);

  const projectListData = JSON.parse(projectList.projects);


  try {

    projectListData.forEach(async element => {        

    const baseurl = `https://dev.azure.com/${organizationName}/${element.name}/_apis/wit/wiql?api-version=7.1`;

    const query = {
      query : "SELECT [System.Title],[System.Id],[System.State] FROM WorkItems WHERE [System.TeamProject] = @project"
    }

    const response = await axios.post(baseurl,query, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
      }
    });
 
    const workitemsId = response.data.workItems.map(item=> item.id);

    const res = [];
    var chunkSize = 199;
    for (let i = 0; i < workitemsId.length; i += chunkSize) {
        const chunk = workitemsId.slice(i, i + chunkSize);
        
    

    const workitemsIds = chunk.toString();


    const responseworkItems = await axios.get(`https://dev.azure.com/${organizationName}/${element.name}/_apis/wit/workitems?ids=${workitemsIds}&api-version=7.1`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
      },
    });
 
    const workItems = responseworkItems.data.value;

    res.push(workItems);
      

    }
    workItemsData = JSON.stringify(res);

    //     let workItemsSaveData = await WorkItems.findOneAndUpdate(
    //   { projectId : element.id },
    //   { $setOnInsert: { organizationName : organizationName, projectId : element.id, projectName : element.name, workItems : workItemsData } },
    //   { upsert: true, new: true, rawResult: true }
    // );

    const WorkItemsSave = new WorkItems({ organizationName : organizationName, projectId : element.id, projectName : element.name, workItems : workItemsData  });
    await WorkItemsSave.save();

    
});

console.log("work items running");
    
  } catch (error) {
    next(error);
  }
});


const projectlist = async (req, res, next) => {
   const { organizationName } = req.body || process.env.ORGANIZATION;
   

  try {
    const projectList = await Project.findOne({ organizationName }).sort({_id:-1}).limit(1);

    const projectListData = JSON.parse(projectList.projects);
    

    res.json({ projectListData });
  } catch (error) {
    next(error);
  }
};

const workitems = async (req, res, next) => {
   const { projectId } = req.body;

  try {
    const workItems = await WorkItems.findOne({ projectId }).sort({_id:-1}).limit(1);

    const WorkItemsData = JSON.parse(workItems.workItems);
    

    res.json({ WorkItemsData });
  } catch (error) {
    next(error);
  }
};


module.exports = { projectlist,workitems };