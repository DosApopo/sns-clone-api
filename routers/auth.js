const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../utils/generateidenticon");

const prisma = new PrismaClient();

//ユーザ新規登録
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして",
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return res.json({ user });
});

//ログイン
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "ユーザが存在しません。" });
    }

    const isPasswordVaild = await bcrypt.compare(password, user.password);
    if (!isPasswordVaild) {
      return res.status(401).json({ error: "パスワードが間違っています。" });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.BUILD_MODE === "production",
      sameSite: process.env.BUILD_MODE === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "ログインに成功しました。" });
  } catch (err) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
});

//ログアウト
router.post("/logout", async (res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.BUILD_MODE === "production",
      sameSite: process.env.BUILD_MODE === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "ログアウトに成功しました。" });
  } catch (err) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
});

module.exports = router;
