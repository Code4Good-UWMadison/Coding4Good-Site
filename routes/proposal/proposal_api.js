var express = require('express');
var db = require('../../server/proposal_db');
const emailService = require('../services/email_service');
var router = express.Router();

router.post('/createProposal', function (req, res, next) {
    var proposal = req.body;
    db.createProposal(proposal, function (err) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Failed to create'});
            return;
        }
        else {
            var emailDetail = {
                subject: 'Proposal from the website',
                html: '<h4>Org Info: <br> <hr>'
                + 'Org Name: ' + proposal.org_name + '<br>'
                + 'Org Type: ' + proposal.org_type + '<br>'
                + 'Org Detail: ' + proposal.org_detail + '<br>'
                + 'Proposer Info: <br> <hr>'
                + 'Name: ' + proposal.name + '<br>'
                + 'Title: ' + proposal.position + '<br>'
                + 'Email: ' + proposal.email + '<br>'
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
        }
    });
});

module.exports = router;