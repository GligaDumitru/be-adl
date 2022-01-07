const mongoose = require("mongoose");
const httpStatus = require("http-status");
const httpMocks = require("node-mocks-http");
const {
  convertToErrorMiddleware,
  errorHandler,
} = require("../../../src/middlewares/error");
const ApiError = require("../../../src/utils/ApiError");
const config = require("../../../src/config/getEnv");
const logger = require("../../../src/config/logger");
const { expectCt } = require("helmet");

const getMockReq = () => httpMocks.createRequest();
const getMockRes = () => httpMocks.createResponse();

describe("Error for middlewares", () => {
  describe("Test ApiError class", () => {
    test("should have message, statusCode and stack if exist", () => {
      const error = new ApiError(
        httpStatus.BAD_REQUEST,
        httpStatus[httpStatus.BAD_REQUEST],
        [],
        "stack here"
      );
      expect(error).toHaveProperty(
        "message",
        httpStatus[httpStatus.BAD_REQUEST]
      );
      expect(error).toHaveProperty("statusCode", httpStatus.BAD_REQUEST);
      expect(error).toHaveProperty("stack", "stack here");
    });
    test("should have message, statusCode errors and stack if exist", () => {
      const error = new ApiError(
        httpStatus.BAD_REQUEST,
        httpStatus[httpStatus.BAD_REQUEST],
        ["Field required"],
        "stack here"
      );
      expect(error).toHaveProperty(
        "message",
        httpStatus[httpStatus.BAD_REQUEST]
      );
      expect(error).toHaveProperty("statusCode", httpStatus.BAD_REQUEST);
      expect(error).toHaveProperty("errors", ["Field required"]);
      expect(error).toHaveProperty("stack", "stack here");
    });
  });
  describe("Test the middleware the convertes the Error to ApiError", () => {
    test("should return the same ApiError object that it was called with", () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, "Error here");
      const next = jest.fn();

      convertToErrorMiddleware(error, getMockReq(), getMockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test("should convert an Error to ApiError and preserve the statusCode and message", () => {
      const error = new Error("Error here");
      error.statusCode = httpStatus.BAD_REQUEST;
      const next = jest.fn();

      convertToErrorMiddleware(error, getMockReq(), getMockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: error.statusCode,
          message: error.message,
        })
      );
    });

    test("should convert an Error without status to ApiError with status 500", () => {
      const error = new Error("Error here");
      const next = jest.fn();

      convertToErrorMiddleware(error, getMockReq(), getMockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        })
      );
    });

    test("should convert an Error without message to ApiError with default message of that http status code", () => {
      const error = new Error();
      error.statusCode = httpStatus.BAD_GATEWAY;
      const next = jest.fn();

      convertToErrorMiddleware(error, getMockReq(), getMockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: error.statusCode,
          message: httpStatus[error.statusCode],
        })
      );
    });
    test("should convert a Mongoose error to ApiError with status 400 and preserve its message", () => {
      const error = new mongoose.Error("Error here");
      const next = jest.fn();

      convertToErrorMiddleware(error, getMockReq(), getMockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
          message: error.message,
        })
      );
    });

    test("should convert any other object to ApiError with statusCode 500 and its message", () => {
      const error = new Object();
      const next = jest.fn();

      convertToErrorMiddleware(error, getMockReq(), getMockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
        })
      );
    });
  });
  describe("Test the the middleware that handles the error", () => {
    beforeEach(() => {
      jest.spyOn(logger, "error").mockImplementation(() => {});
    });

    test("should send proper error response and put the error message in res.locals for morgan logger", () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, "Error here");
      const res = getMockRes();
      const req = getMockReq();

      const sendSpy = jest.spyOn(res, "send");

      errorHandler(error, req, res);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
        })
      );

      expect(res.locals.errorMessage).toEqual(error.message);
    });

    test("should put the error stack in the response if the development mode is on", () => {
      config.env = "development";
      const error = new ApiError(httpStatus.BAD_REQUEST, "Error here");
      const res = getMockRes();
      const req = getMockReq();
      const sendSpy = jest.spyOn(res, "send");

      errorHandler(error, req, res);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
          stack: error.stack,
        })
      );
      config.env = process.env.NODE_ENV;
    });

    test("should put errors array in the error if exist", () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, "Error here", [
        "Field is required",
      ]);
      const res = getMockRes();
      const req = getMockReq();
      const sendSpy = jest.spyOn(res, "send");

      errorHandler(error, req, res);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
          errors: error.errors,
        })
      );
    });

    test("should set the status code to 500 if there is no status code ", () => {
      const error = new Error("Error here");
      const res = getMockRes();
      const req = getMockReq();

      const sendSpy = jest.spyOn(res, "send");

      errorHandler(error, req, res);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        })
      );

      expect(res.locals.errorMessage).toEqual(error.message);
    });
    test("should set the message to status code message if not set", () => {
      const error = new Error();
      error.statusCode = httpStatus.BAD_GATEWAY;
      const res = getMockRes();
      const req = getMockReq();

      const sendSpy = jest.spyOn(res, "send");

      errorHandler(error, req, res);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: httpStatus[error.statusCode],
        })
      );
    });
  });
});
