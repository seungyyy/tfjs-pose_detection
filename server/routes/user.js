const { Router } = require("express")
const router = Router();
const asyncHandler = require("./../utils/async-handler");
const crypto = require('crypto');
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const jwtConfig = require("./../config/jwtConfig");

const pbkdf2Promise = util.promisify(crypto.pbkdf2); //for hash
const randomBytesPromise = util.promisify(crypto.randomBytes); //for hash

//------------- 회원가입 --------------------
router.post("/signup", asyncHandler(async (req, res, next) => {
  const { email, password, name } = req.body;

  const checkEmail = await User.findOne({ email })
  
  if (checkEmail) {
    res.status(500)
    res.json({ error: "이미 가입된 이메일입니다." })
    return
  }
  
  createHashedPassword(password).then((res) => { 
    User.create({
      email,
      password: res.hashedPassword,
      salt: res.salt,
      name,
    });
  })

  res.json({
    result: "회원가입이 완료되었습니다. 로그인을 해주세요."
  })
}));


//------------- 로그인 --------------------
router.post("/login", asyncHandler(async (req, res, next) => { 
  const { email, password } = req.body;

  let hashPassword = passwordHash(password)

  const checkEmail = await User.findOne({ email })
  
  if (!checkEmail) { 
    res.status(401);
    res.json({
      fail: "존재하지 않는 이메일입니다."
    })

    return;
  }

  const verified = await verifyPassword(
    password, 
    checkEmail.salt,
    checkEmail.password,
  )

  if (!verified) {
    res.status(401);
    res.json({
      fail: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
    return;
  }

  jwt.sign({
    email: email,
    name: checkEmail.name,
  }, jwtConfig.secret, {
    expiresIn: '1d'
  }, (err, token) => { 
    if (err) {
      res.status(401).json({ status: false, message: "로그인을 해주세요." })
    } else { 
      res.json({
        status: true,
        accessToken: token,
        email: email,
        name: checkEmail.name
      })
    }
  })
}))


//------------- 비밀번호변경 --------------------
router.post("/findpw", asyncHandler(async (req, res, next) => { 
  const { email, password } = req.body;
  const user = await User.findOne({ email })
  
  if (!user) { 
    res.status(401).json({ fail: "존재하지 않는 이메일입니다." })
    return;
  }

  const key = await pbkdf2Promise(password, user.salt, 108273, 64, "sha512");
  const hashedPassword = key.toString("base64")
  console.log("newpassword", hashedPassword)

  await User.findOneAndUpdate({ salt: user.salt }, {
    password: hashedPassword
  })

  res.json({
    result: "비밀번호가 변경되었습니다.로그인을 해주세요."
  })
}))

// hash

const createSalt = async () => {
  const buf = await randomBytesPromise(64);
  return buf.toString('base64');
};

const createHashedPassword = async (password) => { 
  const salt = await createSalt();
  const key = await pbkdf2Promise(password, salt, 104906, 64, 'sha512');
  const hashedPassword = key.toString('base64');

  return { hashedPassword, salt }
}

const verifyPassword = async (password, userSalt, userPassword) => { 
  const key = await pbkdf2Promise(password, userSalt, 99999, 64, 'sha512');
  const hashedPassword = key.toString('base64')

  if (hashedPassword === userPassword) return true
  return false
}

module.exports = router;