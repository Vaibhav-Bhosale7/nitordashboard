const axios = require('axios');
const Project = require('../models/project');
const User = require('../models/user');
const WorkItems = require('../models/workItems');
var cron = require('node-cron');

// Getting project list & saving into db
  cron.schedule('0 0 * * *', async () => { 

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

    const ProjectSave = new Project({ organizationName: process.env.ORGANIZATION, projects: projectsData  });
    await ProjectSave.save();

    console.log("project running");

  } catch (error) {
    console.log(error);
  }
});


// Getting user list & saving into db
  cron.schedule('0 0 * * *', async () => { 

  const organization = process.env.ORGANIZATION;
  const pat = process.env.ACCESS_TOKEN;

  try {
    const response = await axios.get(`https://vssps.dev.azure.com/${organization}/_apis/graph/users?api-version=7.1-preview`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
      },
    });

   
    const userlist = response.data.value;

    usersData = JSON.stringify(userlist);

    const UserSave = new User({ organizationName: process.env.ORGANIZATION, users: usersData  });
    await UserSave.save();

    console.log("users running");
    

  } catch (error) {
    console.log(error);
  }
});


// getting project wise work items list and saving into db
cron.schedule('0 0 * * *', async () => { 

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

    const WorkItemsSave = new WorkItems({ organizationName : organizationName, projectId : element.id, projectName : element.name, workItems : workItemsData });
    await WorkItemsSave.save();

    
});

console.log("work items running");
    
  } catch (error) {
    console.log(error);
  }
});


const projectlist = async (req, res, next) => {
   const organizationName = process.env.ORGANIZATION;

  try {
    const projectList = await Project.findOne({ organizationName }).sort({_id:-1}).limit(1);

    const projectListData = JSON.parse(projectList.projects);
    

    res.json({ projectListData });
  } catch (error) {
    next(error);
  }
};

const workitems = async (req, res, next) => {
   const { projectId,filterDate } = req.body;

  try {

    const workItems = await WorkItems.findOne({ projectId }).sort({_id:-1}).limit(1);

    const WorkItemsData = JSON.parse(workItems.workItems);

    res.json({ WorkItemsData });
  } catch (error) {
    next(error);
  }
};

const userlist = async (req, res, next) => {
   const organizationName = process.env.ORGANIZATION;
   
  try {
    const userList = await User.findOne({ organizationName }).sort({_id:-1}).limit(1);

    const userListData = JSON.parse(userList.users);
    

    res.json({ userListData });
  } catch (error) {
    next(error);
  }
};


// getting user wise work items list and saving into db
cron.schedule('0 0 * * *', async () => { 

  const organizationName = process.env.ORGANIZATION;
  const pat = process.env.ACCESS_TOKEN;
      

    const userList = await User.findOne({ organizationName }).sort({_id:-1}).limit(1);

  const userListData = JSON.parse(userList.users);


  try {

    userListData.forEach(async element => {        

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

    const WorkItemsSave = new WorkItems({ organizationName : organizationName, projectId : element.id, projectName : element.name, workItems : workItemsData });
    await WorkItemsSave.save();

    
});

console.log("work items running");
    
  } catch (error) {
    console.log(error);
  }
});

module.exports = { projectlist,workitems,userlist };