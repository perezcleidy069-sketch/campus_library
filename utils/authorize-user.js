const authorizeUser = (req, res, next)=>{
    const auth = req.signedCookies.auth;
    if(!auth){
        return res.status(404).send({
            error: 'User is not authorized'
        });
    }

    next();
}

export default authorizeUser;
