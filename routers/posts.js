const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

//つぶやき投稿API
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "投稿内容がありません" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "サーバーエラー" });
  }
});

//最新つぶやきAPI
router.get("/get_latest_post", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createAt: "desc" },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    return res.json(latestPosts);
  } catch (err) {
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//その閲覧しているユーザーの投稿内容のみ取得
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const userPosts = await prisma.post.findMany({
        where: {
          authorId: parseInt(userId),
        },
        orderBy: {
          createAt: "desc",
        },
        include: {
          author: true,
        },
      });

      return res.status(200).json(userPosts);
    } catch (err) {
      res.status(500).json({ message: "サーバーエラーです" });
    }

    return res.json(latestPosts);
  } catch (err) {
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

module.exports = router;
