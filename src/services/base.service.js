'use strict';

class BaseService {
    constructor(model) {
        this.model = model;
    }

    getAll() {
        return this.model.find().lean();
    }

    create(item) {
        return this.model.create(item);
    }

    update(id, item) {
        return this.model.findByIdAndUpdate(id, item, { new: true }).lean();
    }

    getById(id) {
        return this.model.findById(id).lean();
    }

    remove(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = BaseService;