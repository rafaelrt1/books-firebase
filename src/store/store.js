import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "./booksSlice.js";
import usersSlice from "./usersSlice.js";

export default configureStore({
  reducer: {
    books: booksReducer,
    users: usersSlice,
  },
});
