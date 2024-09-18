import { useParams, Link, useNavigate } from "react-router-dom";
import Notes from "../components/Notes.jsx";
import { useDispatch } from "react-redux";
import { eraseBook, toggleRead, fetchBooks } from "../store/booksSlice.js";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";

const SingleBookPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEraseBook = (id) => {
    if (
      confirm(
        "Are you sure you want to erase this book and all notes associated with it?"
      )
    ) {
      dispatch(eraseBook(id));
      //dispatch(eraseBookNotes(id));
      navigate("/");
    }
  };

  const { id } = useParams();
  const [book, setBook] = useState("");
  const [fetchStatus, setFetchStatus] = useState("idle");

  const fetchBook = async (bookId) => {
    try {
      const docRef = doc(db, "books", bookId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBook({ ...docSnap.data(), id: docSnap.id });
      }
      setFetchStatus("success");
    } catch (e) {
      console.error(e);
      setFetchStatus("error");
    }
  };

  const handleToggleRead = async (info) => {
    dispatch(toggleRead({ id: info.id, isRead: info.isRead }));
    setBook({ ...book, isRead: !info.isRead });
  };

  useEffect(() => {
    if (fetchStatus === "idle") {
      fetchBook(id);
    }
  }, []);

  return (
    <>
      <div className="container">
        <Link to="/">
          <button className="btn">← Back to Books</button>
        </Link>

        {book ? (
          <div>
            <div className="single-book">
              <div className="book-cover">
                <img src={book.cover} />
              </div>

              <div className="book-details">
                <h3 className="book-title">{book.title}</h3>
                <h4 className="book-author">{book.author}</h4>
                <p>{book.synopsis}</p>
                <div className="read-checkbox">
                  <input
                    onClick={() => {
                      handleToggleRead({ id: book.id, isRead: book.isRead });
                    }}
                    type="checkbox"
                    defaultChecked={book.isRead}
                  />
                  <label>
                    {book.isRead ? "Already Read It" : "Haven't Read it yet"}
                  </label>
                </div>
                <div
                  onClick={() => handleEraseBook(book.id)}
                  className="erase-book"
                >
                  Erase book
                </div>
              </div>
            </div>

            <Notes bookId={id} />
          </div>
        ) : fetchStatus === "success" ? (
          <div>
            <p>
              Book not found. Click the button above to go back to the list of
              books.
            </p>
          </div>
        ) : fetchStatus === "error" ? (
          <div>
            <p>Error fetching the book.</p>
          </div>
        ) : (
          <div>
            <p>Loading...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SingleBookPage;
