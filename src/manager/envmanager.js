require('dotenv').config();

const base_url = process.env.BASE_URL;
const forge = process.env.FORGE;
const root = process.env.ROOT;
const java = process.env.JAVA;

exports.getBase_url = function(){
    return base_url;
}

exports.getForge = function(){
    return forge;
}

exports.getRoot = function(){
    return root;
}

exports.getJava = function(){
    return java;
}