// node Router
const {Router} = require('express');
const router = Router();

// конфигурация
const config = require('config');

// токен для процесса login
const jwt = require('jsonwebtoken');

// валидация из пакета express-validator
const {check, validationResult} = require('express-validator');

// шифрование паролей
const bcrypt = require('bcryptjs');

//подключаем модель MongoDB
const User = require('../models/User');

// /api/auth/register
router.post(
    '/register',
    // middleware - валидация полей req
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов')
            .isLength({ min: 6 })
    ],
    async (req, res) => {
    try {
        // обработка валидации полей
        const errors = validationResult(req);

        // если ошибки
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Некорректные данные при регистрации'
            })
        }

        // #Логика регистрации
        // получаем данные из request
        const {email, password} = req.body;

        const candidate = await User.findOne({ email : email});

        //проверяем есть ли такой пользователь
        if (candidate) {
            return res.status(400).json({message: 'Такой пользователь уже существует'})
        }

        const hashedPassword = await bcrypt.hash(password, 12);  // хэшируем пароль
        const user = new User({ email, password: hashedPassword });  // создаем юзера

        await user.save();

        res.status(201).json({ message: 'Пользователь создан' });


    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
});

// /api/auth/login
router.post(
    '/login',
    // middleware - валидация полей req
    [
      check('email', 'Введите корректный email').normalizeEmail().isEmail(),
      check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try {
        // обработка валидации полей
        const errors = validationResult(req);

        // если ошибки
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Некорректные данные при входе в систему'
            })
        }

        // #Логика авторизации
        const {email, password} = req.body;

        // Ищем пользователя
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        // проверка на совпаднее паролей
        const isMatchPasswords = await bcrypt.compare(password, user.password);

        if (!isMatchPasswords) {
            return res.status(400).json({ message: 'Неверный пароль, попробуйте снова' });
        }

        const token = jwt.sign(
            { userId: user.id },  // данные которые зашифрованы в токене
            config.get('jwtSecret'), // секретный ключ
            { expriresIn: '1h' },  // длительность действия токена авторизации
        );

        res.json({ token, userId: user.id })

    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
});

module.exports = router;