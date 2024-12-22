'use strict';

const errorHandler = require('../../untils/errorHandler');
const languageItService = require('./../services/language.service');


exports.getAllLanguages = errorHandler(async (req, res) => {
    const languages = await languageItService.getAll();
    res.status(200).json(languages);
});

exports.getLanguageById = errorHandler(async (req, res) => {
    const language = await languageItService.getById(req.params.id);
    res.status(200).json(language);
});

exports.createLanguage = errorHandler(async (req, res) => {
    const language = await languageItService.create(req.body);
    res.status(201).json(language);
});

exports.updateLanguage = errorHandler(async (req, res) => {
    const language = await languageItService.update(req.params.id, req.body);
    res.status(200).json(language);
});

exports.deleteLanguage = errorHandler(async (req, res) => {
    await languageItService.remove(req.params.id);
    res.status(204).send();
});
