import CropSize from '../enums/cropSize';

export function getDimensions(size: CropSize) {
    switch (size) {
        case CropSize.Bush:
            return {
                width: 2,
                height: 2
            }

        case CropSize.Tree:
            return {
                width: 3,
                height: 3
            }

        case CropSize.Single:
        default:
            return {
                width: 1,
                height: 1
            }
    }
};  
