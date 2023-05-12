import { useEffect, useState } from "preact/hooks";
import styled, { createGlobalStyle } from "styled-components";

import { LoadingIcon } from "./components/LoadingIcon";

// global styles
const GlobalStyle = createGlobalStyle`

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #2B8CFF;
  }

  #app { // stick footer to bottom
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const AppWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 960px;
`

const Header = styled.div`
  color: white;

  p {
    font-size: 20px;
    font-family: sans-serif;
  }
`

const Box = styled.div`
  padding: 1em;
  background-color: #fff;
  border: 5px solid #000000;
  box-shadow: 0px 0px 18px -5px #000000;
  margin: 0em auto 2em auto;
  width: 100%;

  p {
    text-align: center;
    font-size: 18px;
    font-family: sans-serif;
  }

  input {
    margin: 0 auto; 
    width: 100%;
    font-size: 24px;
  }

  overflow-x: auto;
`

const TipBox = styled.div`
  h1 {
    font-size: 20px;
    text-align: center;
    font-family: sans-serif;
    margin: 0;
  }

  p {
    margin: 0;
    font-size: 14px;
  }

  background: rgba(43, 140, 255, 0.42);
  border: 1px solid #000000;

  margin: 1em auto;

  max-width: 500px;

  padding: 10px;
`

const Button = styled.button`
  width: 100%;
  padding: 5px;
  font-size: 20px;
  color: #FFFFFF;
  font-weight: bold;
  background-color: ${props => props.disabled ? "grey" : "#2B8CFF"};
  border: 1px solid #000000;
  &:hover {
    cursor: pointer;
  }

`

const SmallButton = styled.button`
  width: auto;
  padding: 5px;
  margin-top: 1em;
  font-size: 20px;
  color: #FFFFFF;
  font-weight: bold;
  border: 1px solid #000000;
  // center
  position: relative;

  ${props => props.inline ? "" : "left: 50%;\
  transform: translate(-50%, -50%);" }
  

  background-color: ${props => props.disabled ? "grey" : "#2B8CFF"};

  &:hover {
    cursor: pointer;
  }
`

const RedirectLoading = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  height: 100vh;
`

const FlashErrP = styled.p`
  background-color: ${props => props.flash ? "orange" : ""};
  transition: background-color 0.5s;
`

const RedirectContainer = styled.div`
  display: flex;
`

const RedirectP = styled.p`
  font-size: 1.2em;  
  color: #ffffff;
  font-family: sans-serif;
  margin: 0 5px 0 0;
`

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  color: white;
  font-family: sans-serif;
  margin-top: 2em;
  margin-bottom: 0.2em;
`

const Footer = styled.div`
  padding: 30px;
  background-color: white;
  margin-top: auto;
`

const FooterP = styled.p`
  text-align: center;
  font-family: sans-serif;
`
const FooterA = styled.a`

  font-weight: ${props => props.bold ? "bold" : ""};
  &:visited {
    color: black;
  }
`

export const App = () => {


  const [URLText, setURLText] = useState("");
  const [URLTextErr, setURLTextErr] = useState("");
  const [flashURLErr, setFlashURLErr] = useState(false);
  const [clickURLText, setClickURLText] = useState("");
  const [clicksErr, setClicksErr] = useState("");
  const [flashClickErr, setFlashClickErr] = useState(true);

  const [shortURL, setShortURL] = useState("");
  const [longURL, setLongURL] = useState("");

  const [statsShortURL, setStatsShortURL] = useState("");
  const [statsLongURL, setStatsLongURL] = useState("");

  const [newlyGenerated, setNewlyGenerated] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [showClickCount, setShowClickCount] = useState(false);

  const domain = window.location.protocol + "//" + window.location.host + "/";

  const [loadingShortURL, setLoadingShortURL] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [loadingCountUpdateButton, setLoadingCountUpdateButton] = useState(false);

  const [redirectLoading, setRedirectLoading] = useState(false);

  const [copyText, setCopyText] = useState("Copy");
  const [copyTextStats, setCopyTextStats] = useState("Copy");

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  const flashTimeMS = 1000;

  const handleShorten = async () => {

    let validURL;
    try {
      validURL = new URL(URLText);
      setURLTextErr("");
    } catch {
      setFlashURLErr(true);
      setURLTextErr("URL invalid. Please enter a valid URL like https://example.com/longpathhere")
      setTimeout(() => {
        setFlashURLErr(false);
      }, flashTimeMS);
      return;
    }

    
    const params = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: `longURL=${validURL}`
    }
  
    setLoadingShortURL(true);
    try {
      const result = await fetch("https://2lzygspqxb.execute-api.us-west-2.amazonaws.com/prod/shorten", params);
      const data = await result.json();

      setShortURL(data.shortURL);
      setLongURL(URLText);
      setNewlyGenerated(true);
    } catch {
      setFlashURLErr(true);
      setURLTextErr("Error shortening URL.");
      setTimeout(() => {
        setFlashClickErr(false);
      }, flashTimeMS)
    }
    setLoadingShortURL(false);
  }

  const getLongURL = async (shortURL) => {

    const params = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: `shortID=${shortURL}`
    }
  
    const result = await fetch("https://2lzygspqxb.execute-api.us-west-2.amazonaws.com/prod/lengthen", params);
    const data = await result.json();
    console.log(data.longURL);
    if (data.longURL != undefined) {
      return data.longURL;
    } else {
      return false;
    }
  }

  const getStats = async (shortURL) => {

    const params = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: `shortID=${shortURL}`
    }
    const result = await fetch("https://2lzygspqxb.execute-api.us-west-2.amazonaws.com/prod/stats", params);
    const data = await result.json();

    if (data.result != "Not found") {
      return data;
    } else {
      return false;
    }
  }

  const handleClickCount = () => {
    // strip domain, scheme, etc and only grab short ID
    let shortIDofURL = clickURLText.replace(/^.*\/\/[^\/]+\/?/, '');
    // redirect to the stats page of short ID
    window.location.replace(domain + "app/stats?q=" + shortIDofURL);
  }

  const getCopyRightYear = () => {

    // year to start from
    let startYear = 2023;

    let curYear = new Date().getFullYear();
    let yearString = "";

    if (startYear < curYear) {
        yearString = startYear.toString() + "-" + curYear.toString();
    } else {
        yearString = startYear.toString();
    }

    return yearString;

  }

  const copyToClipboard = (text, copyID) => {
    navigator.clipboard.writeText(text);

    if (copyID == "shortURL") {
      setCopyText("Copied!");
      setTimeout(() => {
        setCopyText("Copy")
      }, 300);
    } else if (copyID == "statsURL") {
      setCopyTextStats("Copied!");
      setTimeout(() => {
        setCopyTextStats("Copy")
      }, 300);
    }
  }

  const refreshStats = async (usingUpdateButton) => {

    let value = params.q;

    let stats;
    if (usingUpdateButton) {
      setLoadingCountUpdateButton(true);
      stats = await getStats(value);
      setLoadingCountUpdateButton(false);
    } else {
      setLoadingCount(true);
      stats = await getStats(value);
      setLoadingCount(false);
    }

    if (stats.clicks != undefined) {
      setClickCount(stats.clicks);
      setShowClickCount(true);
      setStatsShortURL(value);
      setStatsLongURL(stats.longURL);
      setClicksErr("");
    } else {
      setFlashClickErr(true);
      setClicksErr(`Couldn't find the shortened URL "${value}"`)
      setShowClickCount(false);
      setTimeout(() => {
        setFlashClickErr(false);
      }, flashTimeMS)
    }
  }

  useEffect(async () => {
    let path = window.location.pathname;

    if (path.search("^\/[a-zA-Z0-9]+$") != -1 && !path.search("^\/app\/.*$") != -1) {
      setRedirectLoading(true);
      let longURL = await getLongURL(path.substring(1));
      if (longURL) {
        window.location.replace(longURL);
      } else {
        alert(`The short URL "${path.substring(1)}" does not exist.`);
        setRedirectLoading(false);
      }
    }

    if (path.search("^\/app\/stats.*$") != -1) {
      refreshStats(false);
    }
  }, []);


  return (
    <>

      <GlobalStyle />


      { redirectLoading ?

        <RedirectLoading>
          <RedirectContainer>
            <RedirectP>Redirecting...</RedirectP>
            <LoadingIcon />
          </RedirectContainer>
        </RedirectLoading>
       
      :
      <>
      <AppWrapper>

        <Header>
          <Title>
              &#128279; femto.click &#128279;
          </Title>

          <p>femto.click is a URL shortener that takes it name from the International System of Units (SI) prefix <span style="font-style: italic;">femto</span> designating one quadrillionth of a given unit (ie. very, very small)</p>
        </Header>
        <Box>
          <div>
            <p>Enter a long URL below to shorten it.</p>
            <input type="text" placeholder="Enter a long URL" value={URLText} onInput={(e) => setURLText(e.target.value)}/>

            <Button onClick={handleShorten} disabled={loadingShortURL}>Shorten it! { loadingShortURL ? <LoadingIcon /> : ""}</Button>

          
          </div>

          <div>
            <FlashErrP flash={flashURLErr}>{URLTextErr}</FlashErrP>
            { newlyGenerated ? 
              <p>Your new shortened URL is <a href={domain + shortURL}>{domain + shortURL}</a>&nbsp;<SmallButton inline onClick={() => copyToClipboard(domain + shortURL, "shortURL")}>{copyText}</SmallButton> which redirects to <a href={longURL}>{longURL}</a></p>
            : ""}

          </div>

        </Box>

        <Box>
          <p>Already generated a short URL? Enter it below to see how many clicks it has. </p>


          <TipBox>
            <h1>Tip</h1>
            <p>Enter either the full URL or the short ID. Example: {domain}FD78ew or FD78ew</p>
          </TipBox>

          <input type="text" placeholder="Enter your short URL" value={clickURLText} onInput={(e) => setClickURLText(e.target.value)}/>

          <Button onClick={handleClickCount} disabled={loadingCount}>Get click count! { loadingCount ? <LoadingIcon /> : ""}</Button>

          

          <div>
            {showClickCount ? 
              <>
                <p>Your shortened URL <a href={domain + statsShortURL}>{domain + statsShortURL}</a>&nbsp;<SmallButton inline onClick={() => copyToClipboard(domain + statsShortURL, "statsURL")}>{copyTextStats}</SmallButton> has {clickCount} click(s) and redirects to <a href={statsLongURL}>{statsLongURL}</a></p>
                <SmallButton onClick={() => refreshStats(true)} disabled={loadingCountUpdateButton}>Click to update { loadingCountUpdateButton ? <LoadingIcon /> : ""}</SmallButton> 
                <TipBox>
                  <h1>Tip</h1>
                  <p>You can bookmark this page for future reference.</p>
                </TipBox>
              </>
            : ""}

            <FlashErrP flash={flashClickErr}>{clicksErr}</FlashErrP>
            
          </div>

        </Box>
          
        </AppWrapper>
        <Footer>
          <FooterP>&copy; <FooterA href="https://jeremycarder.ca">Jeremy Carder</FooterA> {getCopyRightYear()} &bull; <FooterA bold href="https://femto.click">https://femto.click</FooterA></FooterP>
        </Footer>
        </>
      }
      
    </>
  )
}
