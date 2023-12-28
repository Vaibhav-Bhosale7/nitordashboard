const axios = require('axios');
const Project = require('../models/project');
const WorkItems = require('../models/workItems');

// Getting project list
const projectlistdata = async (req, res, next) => {

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

    // const project = new Project({ organizationName : process.env.ORGANIZATION, projects : projectsData  });
    // await project.save();

      let project = await Project.findOneAndUpdate(
      { organizationName: process.env.ORGANIZATION },
      { $setOnInsert: { organizationName: process.env.ORGANIZATION, projects: projectsData } },
      { upsert: true, new: true, rawResult: true }
    );

   res.json({ message: 'Projects saved' });

  } catch (error) {
    next(error);
  }
};


const workitemlistdata = async (req, res, next) => {

  const organizationName = process.env.ORGANIZATION;
  const pat = process.env.ACCESS_TOKEN;
      

  const projectList = await Project.findOne({ organizationName });

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
      

    // const workItemsSaveData = new WorkItems({ organizationName : organizationName, projectId : element.id, projectName : element.name, workItems : workItemsData  });
    // await workItemsSaveData.save();

    }
    workItemsData = JSON.stringify(res);

        let workItemsSaveData = await WorkItems.findOneAndUpdate(
      { projectId : element.id },
      { $setOnInsert: { organizationName : organizationName, projectId : element.id, projectName : element.name, workItems : workItemsData } },
      { upsert: true, new: true, rawResult: true }
    );
});
    res.json({ message: 'Work items saved' });
    
  } catch (error) {
    next(error);
  }
};


const projectlist = async (req, res, next) => {
   const { organizationName } = req.body || process.env.ORGANIZATION;
   

  try {
    const projectList = await Project.findOne({ organizationName });

    const projectListData = JSON.parse(projectList.projects);
    

    res.json({ projectListData });
  } catch (error) {
    next(error);
  }
};

const workitems = async (req, res, next) => {
   const { projectId } = req.body;

  try {
    const workItems = await WorkItems.findOne({ projectId });

    const WorkItemsData = JSON.parse(workItems.workItems);
    

    res.json({ WorkItemsData });
  } catch (error) {
    next(error);
  }
};


module.exports = { projectlistdata,workitemlistdata,projectlist,workitems };