const express = require('express');
const { projectlistdata,workitemlistdata,projectlist,workitems } = require('../controllers/project');

const router = express.Router();

//router.post('/listdata', projectlistdata);


//router.post('/workitemsdata', workitemlistdata);

router.post('/list', projectlist);

router.post('/workitems', workitems);

module.exports = router;