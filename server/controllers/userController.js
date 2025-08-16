import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET_KEY = "helloworld";

const signup = async (req, res) => {
  const { name, pass, email, role } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exist" });
    } else {
      const hashedPassword = await bcrypt.hash(pass, 10);
      const result = await userModel.create({
        name: name,
        pass: hashedPassword,
        email: email,
        role: role,
      });

      const token = jwt.sign(
        { email: result.email, role: result.role, id: result._id },
        SECRET_KEY
      );
      res.status(201).json({ user: result, token: token });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const signin = async (req, res) => {
  const { email, pass } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(pass, existingUser.pass);
    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      {
        email: existingUser.email,
        role: existingUser.role,
        id: existingUser._id,
      },
      SECRET_KEY
    );

    res.status(201).json({ user: existingUser, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const googleLogin = async (req, res) => {
  const { name, email } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      const pass = Date.now().toString();
      const hashedPassword = await bcrypt.hash(pass, 10);
      const result = await userModel.create({
        name: name,
        pass: hashedPassword,
        email: email,
        role: "user",
      });
      const token = jwt.sign(
        { email: result.email, role: result.role, id: result._id },
        SECRET_KEY
      );
      res.status(201).json({ user: result, token: token });
    } else {
      const token = jwt.sign(
        {
          email: existingUser.email,
          role: existingUser.role,
          id: existingUser._id,
        },
        SECRET_KEY
      );
      res.status(201).json({ user: existingUser, token: token });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export { signup, signin, googleLogin };
