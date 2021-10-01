const nodemailer = require('nodemailer');
const user_db = require('./server/user_db');
const event_db = require('./server/event_db');


setInterval(() => {
    user_db.getAllEntriesFromUserEvent((err, user_event_entries) => {
        if (err) {
            console.log("Failed to get all entries from user event");
            return;
        }
        user_event_entries.rows.forEach((row) => {
            const uid = row.uid;
            const rsvp_events = JSON.parse(row.rsvp_events);
            rsvp_events.forEach((rsvp_event) => {
                event_db.getEventById(rsvp_event, (err, event_info) => {
                    if (!err) {
                        let now = new Date();
                        // TODO: !!!!!!!!
                        if (!(now.toLocaleDateString() === event_info.event_time.toLocaleDateString())) {
                            user_db.getUserEmailById(uid, (err, user_email) => {
                                if (!err) {
                                    let mail_options = {
                                        from: process.env.EMAILUSER,
                                        to: user_email.email,
                                        subject: 'Event Reminder: ' + event_info.title,
                                        text: event_info.description,
                                    };
                                    let transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: process.env.EMAILUSER,
                                            pass: process.env.EMAILPASS,
                                        }
                                    });
                                    transporter.sendMail(mail_options, (err, info) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            user_db.unrsvpEvent(uid, event_info.id, (err) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                console.log('Email sent: ' + info.response);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            });
        })
    });
}, 1000);
