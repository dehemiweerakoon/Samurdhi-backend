import Joi from 'joi';
import mongoose from 'mongoose';

const sectorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 100,
            trim: true,
        },
        bank: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bank',
            required: true,
        },
        location: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 255,
            trim: true,
        },
    },
    { timestamps: true },
);

export const Sector = mongoose.model('Sector', sectorSchema);

const sectorFields = {
    name: Joi.string().min(3).max(100).required(),
    bank: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'MongoDB ObjectId').required(),
    location: Joi.string().min(2).max(255).required(),
};

export const validateSector = (sector) => Joi.object(sectorFields).validate(sector);

export const validateSectorUpdate = (sector) =>
    Joi.object({
        ...sectorFields,
        name: sectorFields.name.optional(),
        bank: sectorFields.bank.optional(),
        location: sectorFields.location.optional(),
    })
        .min(1)
        .validate(sector);

export { sectorSchema };
