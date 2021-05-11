import "./App.css";
import axios from "axios";
import { useEffect, useState} from "react";
import Navbar from "react-bootstrap/Navbar";
import { Button, Container } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { FormControl } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
function App() {
  const [imageList, setImageList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [lastSearches, setLastSearches] = useState(
    JSON.parse(localStorage.getItem("lastSearches"))
      ? JSON.parse(localStorage.getItem("lastSearches"))
      : []
  );

  const [search, setSearch] = useState("");
  const recentImages = async () => {
    const response = await axios({
      method: "GET",
      url: `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=6fe5528d67d54160522c43aa311cb7e3&per_page=20&safe_search=1&page=${pageNum}&format=json&nojsoncallback=1`,
    });
    try {
      response.data.photos.photo.map((item) =>
        setImageList((prevArray) => [
          ...prevArray,
          "https://farm" +
            item.farm +
            ".staticflickr.com/" +
            item.server +
            "/" +
            item.id +
            "_" +
            item.secret +
            ".jpg",
        ])
      );
      setLoaded(true);
    } catch (err) {
      console.log('error', err);
    }
  };

  //fetch recent images
  useEffect(() => {
    if (search === "") {
      recentImages();
    }
  }, [search, pageNum]);

  //fetch searches images
  useEffect(() => {
    let cancel;
    axios({
      method: "GET",
      url: `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=6fe5528d67d54160522c43aa311cb7e3&text=${search}&per_page=20&safe_search=1&page=${pageNum}&format=json&nojsoncallback=1`,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        res.data.photos.photo.map((item) =>
          setImageList((prevArray) => [
            ...prevArray,
            "https://farm" +
              item.farm +
              ".staticflickr.com/" +
              item.server +
              "/" +
              item.id +
              "_" +
              item.secret +
              ".jpg",
          ])
        );
        setLoaded(true);
        console.log(search, lastSearches);
        if (search !== lastSearches[0]) {
          setLastSearches([search, ...lastSearches]);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
      });
    return () => cancel();
    // }
  }, [search, pageNum]);

  useEffect(() => {
    localStorage.setItem("lastSearches", JSON.stringify(lastSearches));
  }, [lastSearches]);

  return (
    <div className="App">
      <Navbar
        bg="dark d-flex flex-column justify-content-center"
        variant="dark"
      >
        <Navbar.Brand>Search Photos</Navbar.Brand>
        <Form inline>
          <FormControl
            value={search}
            onChange={(event) => {
              setImageList([]);
              setSearch(event.target.value);
            }}
            type="text"
            placeholder="Search"
            className="mr-sm-2"
          />
        </Form>
      </Navbar>
      <Container>
        {lastSearches &&
          lastSearches.map((item, index) => {
            return (
              <Button key={index}
                onClick={(event) => {
                  setImageList([]);
                  setSearch(item);
                }}
                className="m-2"
                variant="secondary"
              >
                {item}
              </Button>
            );
          })}
        {loaded ? (
          <div className="d-flex flex-row d-flex flex-wrap">
            <InfiniteScroll
              next={() => setPageNum((prevPageNum) => prevPageNum + 1)}
              hasMore={true}
              dataLength={imageList.length}
            >
              {imageList.map((item, index) => {
                return (
                  <img
                    className="m-2 p-2 bd-highlightjustify-content-around"
                    key={index}
                    width="200"
                    src={item}
                    alt="Responsive"
                  ></img>
                );
              })}
            </InfiniteScroll>
          </div>
        ) : (
          <h1>Loading</h1>
        )}
      </Container>
    </div>
  );
}

export default App;
