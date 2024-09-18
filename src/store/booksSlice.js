import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config.js";

export const booksSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    status: "idle",
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        console.error(action.error.message);
      })
      .addCase(toggleRead.fulfilled, (state, action) => {
        state.books.map((book) => {
          if (book.id === action.payload) {
            book.isRead = !book.isRead;
          }
        });
      })
      .addCase(toggleRead.rejected, (state, action) => {
        state.status = "failed";
        console.error(action.error.message);
      })
      .addCase(eraseBook.fulfilled, (state, action) => {
        state.books = state.books.filter((book) => book.id != action.payload);
        state.status = "succeeded";
      })
      .addCase(eraseBook.rejected, (state, action) => {
        state.status = "failed";
        console.error(action.error.message);
      })
      .addCase(eraseBook.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addBook.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(addBook.rejected, (state, action) => {
        state.status = "failed";
        console.error(action);
      });
  },
});

export const selectBooks = (state) => state.books;

export default booksSlice.reducer;

export const fetchBooks = createAsyncThunk("books/fetchBooks", async () => {
  const q = query(
    collection(db, "books"),
    where("user_id", "==", auth.currentUser.uid)
  );
  const querySnapshot = await getDocs(q);
  let booksList = [];
  querySnapshot.forEach((doc) => {
    booksList.push({ id: doc.id, ...doc.data() });
  });
  return booksList;
});

export const toggleRead = createAsyncThunk(
  "books/toggleRead",
  async (payload) => {
    const bookRef = doc(db, "books", payload.id);
    await updateDoc(bookRef, {
      isRead: !payload.isRead,
    });
    return payload.id;
  }
);

export const eraseBook = createAsyncThunk(
  "books/eraseBook",
  async (payload) => {
    await deleteDoc(doc(db, "books", payload));
    return payload;
  }
);

export const addBook = createAsyncThunk("books/addBook", async (payload) => {
  let newBook = { ...payload, user_id: auth.currentUser.uid };
  const docRef = await addDoc(collection(db, "books"), newBook);
  newBook.id = docRef.id;
  return newBook;
});
