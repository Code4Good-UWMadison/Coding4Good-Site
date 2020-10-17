var express = require('express');
var db = require('../../server/proposal_db');
const emailService = require('../services/email_service');
var router = express.Router();

router.post('/createProposal', function (req, res, next) {
    let proposal = req.body;
    db.createProposal(proposal).then(() => {
        console.log("44444444444444444444123");
        let emailDetail = {
            subject: 'Proposal from the website',
            html: '<h4>Org Info: <br> <hr>'
            + 'Org Name: ' + proposal.org_name + '<br>'
            + 'Organization: ' + proposal.org_type + '<br>'
            + 'Email: ' + proposal.org_detail + '<br>'
            + 'Proposer Info: <br> <hr>'
            + 'Phone: ' + proposal.name + '<br>'
            + 'Date: ' + proposal.position + '<br>'
            + 'UserId: ' + proposal.email + '<br>'
            + 'Other Contact: ' + proposal.contact + '<br>'
            + 'Proposal Info: <br> <hr>' 
            + 'Proposal title: ' + proposal.title + '<br>' 
            + 'proposal description: <p>' + proposal.description + '</p></h4>',
        };
        emailService.sendEmail(emailDetail, function(err) {
            if (err) {
                console.log(err);
            }
            else{
                res.json({});
            }
        });
    }).catch(err => {
        console.log("444444444444444444444321");
        console.log(err);
        res.status(400).json({msg: 'Failed to create'});
        return;
    });
});

module.exports = router;