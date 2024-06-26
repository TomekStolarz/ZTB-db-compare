const MEDIUM_QUERY_INDEX = 3;
const MEDIUM_UPDATE_INSERT_INDEX = 2;

const getTableIndex = (type, level) => {
    if (type === 'select') {
        if (level === 'easy') {
            return [MEDIUM_QUERY_INDEX];
        }
        return [0, MEDIUM_QUERY_INDEX];
    }
    if (level === 'easy') {
        return [MEDIUM_UPDATE_INSERT_INDEX];
    }
    return [0, MEDIUM_UPDATE_INSERT_INDEX]
}

const getRandomIndex = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

module.exports = { getTableIndex, getRandomIndex }