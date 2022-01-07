const faker = require("faker");
const bcrypt = require("bcrypt");
const { User } = require("../../../src/models");
const setupTestForDB = require("../../utils/setupTestForDB");
const {
  userPreSaveHook,
  isPasswordMatchingFn,
} = require("../../../src/models/user.model");

setupTestForDB();

describe("Test User Model", () => {
  describe("Test isPasswordMatchingFn fn", () => {
    it("should return false is the passwords are different", async () => {
      const mContext = {
        password: "12345",
      };
      mContext.password = await bcrypt.hash(mContext.password, 10);
      const response = await isPasswordMatchingFn.call(
        mContext,
        "otherpassword"
      );
      expect(response).toBe(false);
    });
    it("should return true is the passwords match", async () => {
      const mContext = {
        password: "12345",
      };
      mContext.password = await bcrypt.hash(mContext.password, 10);
      const response = await isPasswordMatchingFn.call(mContext, "12345");
      expect(response).toBe(true);
    });
  });

  describe("Test isEmailTaken fn", () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "somepasswordhere1",
        role: "user",
      };
    });
    test("should return false is the user in not taken", async () => {
      await expect(await User.isEmailTaken(newUser.email)).toBe(false);
    });
  });

  describe("Test userPreSaveHook fn", () => {
    it("should execute just next middlware hook when password is not modified", async () => {
      const mNext = jest.fn();
      const mContext = {
        isModified: jest.fn(),
        password: "12345",
      };
      mContext.isModified.mockReturnValueOnce(false);
      await userPreSaveHook.call(mContext, mNext);
      expect(mContext.isModified).toBeCalledWith("password");
      expect(mNext).toBeCalledTimes(1);
      expect(mContext.password).toBe(mContext.password);
    });
    it("should hash the password when password is modified", async () => {
      const mNext = jest.fn();
      const mContext = {
        isModified: jest.fn(),
        password: "12345",
      };
      mContext.isModified.mockReturnValueOnce(true);
      await userPreSaveHook.call(mContext, mNext);
      expect(mContext.isModified).toBeCalledWith("password");
      expect(mNext).toBeCalledTimes(1);
      expect(mContext.password).not.toBe("12345");
    });
  });

  describe("Test User Validation", () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "somepasswordhere1",
        role: "user",
      };
    });

    test("should correctly validate a valid user", async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test("should throw a validation error if email is invalid", async () => {
      newUser.email = "adminemail";
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
    test("should throw a validation error if password length is less than 8 characters", async () => {
      newUser.password = "pass1";
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
    test("should throw a valdation error if password does not contain numbers", async () => {
      newUser.password = "password";
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test("should throw a validation error if password does not contain letters", async () => {
      newUser.password = "11111111";
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test("should throw a validation error if role is unkown", async () => {
      newUser.role = "anrerolehere";
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe("Test User Plugin toJSON", () => {
    test("should not return password when toJSON is called", () => {
      const newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "somepasswordhere1",
        role: "user",
      };
      const ss = new User(newUser).toJSON();
      expect(new User(newUser).toJSON()).not.toHaveProperty("password");
    });
  });
});
