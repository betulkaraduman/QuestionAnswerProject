const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../../models/auth");
const Category = require("../../models/category");
const asyncErrorWrapper = require("express-async-handler");
router.get("/", (req, res) => {
  const { userId } = req.session;
  if (userId) {
    auth.findOne({ _id: userId }).then((user) => {
      if (user.role == "User") {
        req.session.sessionFlash = {
          type: "alert alert-danger",
          message: "You have not admin role",
        };
        req.session.destroy(() => {
          res.redirect("auth/login");
        });
       
      }
      res.render("admin/admin");
    });
  } else {
    req.session.sessionFlash = {
      type: "alert alert-danger",
      message: "You have not access",
    };
    req.session.destroy(() => {
      res.redirect("auth/login");
    });
 
  }
});

router.get("/users", (req, res) => {
  auth
    .find({})
    .lean()
    .then((users) => {
      res.render("admin/users", { users: users });
    });
});
router.get(
  "/users/edit/:_id",
  asyncErrorWrapper(async (req, res) => {
    const user = await auth.findOne({ _id: req.params._id }).lean();
    if (user) {
      res.render("admin/editUser", { user: user });
    }
  })
);
router.get(
  "/category",
  asyncErrorWrapper(async (req, res) => {
    const category=await Category.find({}).lean();
      res.render("admin/addCategory",{category:category});
  })
);
router.post(
  "/category",
  asyncErrorWrapper(async (req, res, next) => {
    const categories = await Category.create({
      ...req.body
    });
    
    const category=await Category.find({}).lean();
     res.render("admin/addCategory",{category:category});
  })
);
router.put(
  "/category/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const editCategory=req.body;
      const updateCategory=await Category.findByIdAndUpdate(req.params._id,editCategory,{ new: true,
        runValidators: true,});
        if(updateCategory){
          req.session.sessionFlash = {
            type: "alert alert-success",
            message: "User is updated",
          };
          const category=await Category.find({}).lean();
          res.render("admin/addCategory",{category:category});
        }
  })
);
router.get(
  "/category/edit/:_id",
  asyncErrorWrapper(async (req, res) => {
    const category=await Category.find({}).lean();
    const Acategory = await Category.findOne({ _id: req.params._id }).lean();
    if (Acategory) {
      res.render("admin/addCategory", { Acategory: Acategory ,category:category});
    }
  })
);
router.post(
  "/users",
  asyncErrorWrapper(async (req, res, next) => {
    if (!req.files) {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Images is not upload",
      };
    }

    let postImage = req.files.profile_image;
    postImage.mv(
      path.resolve(__dirname, "../../public/img/postImages", postImage.name)
    );
    const user = await auth.create({
      ...req.body,
      profile_image: `img/postImages/${postImage.name}`,
    });

    req.session.sessionFlash = {
      type: "alert alert-primary",
      message: "User is added",
    };
    res.redirect("users");
  })
);
router.put(
  "/users/:_id",
  asyncErrorWrapper(async (req, res) => {
    if (req.files) {
      const auths = await auth.findById(req.params._id);
      let postImage = req.files.profile_image;
      postImage.mv(
        path.resolve(__dirname, "../../public/img/postImages", postImage.name)
      );
      const imgResult = `img/postImages/${req.files.profile_image.name}`;
      auths.profile_image = imgResult;
      auths.save();
    }
    const editUser = req.body;
    const user = await auth.findByIdAndUpdate(req.params._id, editUser, {
      new: true,
      runValidators: true,
    });
    if (user) {
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "User is updated",
      };
      res.redirect("/admin/users");
    }
  })
);

router.put(
  "/users/block/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const user = await auth.findOne({ _id: req.params._id });
    if (!user.blocked) {
      user.blocked = true;
      await user.save();
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "User is unblocked",
      };
      res.redirect("/admin/users");
    }
  })
);
router.delete(
  "/users/delete/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const user = await auth.findById({ _id: req.params._id });
    await user.remove();
    if (user) {
      req.session.sessionFlash = {
        type: "alert alert-warning",
        message: "User is deleted",
      };
      res.redirect("/admin/users");
    }
  })
);

router.delete(
  "/category/delete/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const deletedCtegory = await Category.findById({ _id: req.params._id });
    await deletedCtegory.remove();
    if (deletedCtegory) {
      req.session.sessionFlash = {
        type: "alert alert-warning",
        message: "category is deleted",
      };
      const category=await Category.find({}).lean();
      res.render("admin/addCategory",{category:category});
    }
  })
);


module.exports = router;
