const {Router} = require('express');
const router = Router();
const config = require('config');
const shortid = require('shortid');

// middleware - проверка на login
const auth = require('../middleware/auth.middleware');

// модель
const Link = require('../models/Link');

router.post('/generate',
    //middleware
    auth,
    async (req, res) => {
        try {
            const baseUrl = config.get('baseUrl');
            const {from} = req.body;

            const code = shortid.generate();

            const existing = await Link.findOne({ from });

            if (existing) {
                return await res.json({link: existing})
            }

            const to = baseUrl + '/t/' + code;

            const link = new Link({
                code, to, from, owner: req.user.userId
            });

            await link.save();

            res.status(201).json({ link })
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
});

router.get('/',
    //middleware
    auth,
    async (req, res) => {
        try {
            const links = await Link.find({ owner: req.user.userId });
            await res.json(links);
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
});

router.get('/:id',
    //middleware
    auth,
    async (req, res) => {
        try {
            const links = await Link.findById(req.params.id); //???
            await res.json(links);
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
});

module.exports = router;