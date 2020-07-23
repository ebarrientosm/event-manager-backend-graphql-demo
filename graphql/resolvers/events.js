const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../helpers/date');
const { transformEvent } = require('./merge');

module.exports = {

    events: () => {

        return Event
        .find()
        .then( events => {
            return events.map( event => {
                return transformEvent(event);
            })    
        }) 
        .catch( error => {
            throw error
        } )
        
    },

    createEvent: (args, req) => {

        if ( !req.isAuth ) {
            throw new Error('Unauthenticated!');
        }
        
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: req.userId
        });

        let createdEvent;

        return event
        .save()
        .then ( event => {
            createdEvent = transformEvent(event);
            return User.findById(req.userId)
        })
        .then( user => {
            if (!user) {
                throw new Error('User not found')
            }
            user.createdEvents.push(event);
            return user.save();
        })
        .then( response => {
            return createdEvent;
        })
        .catch ( error => {
            console.log(error)
            throw error
        });

    }
}