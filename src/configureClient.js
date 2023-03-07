import React,{ useEffect,useRef,useState } from 'react';
import { Form,  InputGroup,Col,Grid,Row, Button} from 'react-bootstrap';


export default function ConfigureClient(ws,ws_url, set_ws_url,config,connected,cookie,updateCookie){
    
    const [thisurl,set_thisurl] = useState(cookie.url);

    useEffect(() => {
        if(!connected){
          console.log("network",ws_url,cookie.url);
          if(cookie != ws_url){
            console.log("fuck unf fuck"); 
            //setAddr(cookie);
          }
          //connect();
        }
      },[cookie,ws_url,connected]);

    const handleSubmit = (e) => {
       
        e.preventDefault();
        console.log("network submitted",thisurl);
        set_ws_url(thisurl);
        updateCookie(thisurl,1000);
        
        console.log("submit clicked",ws.current);
    };
    const onChangeHandler = event => {
        set_thisurl(event.target.value);
     };

     
    

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                
                <label htmlFor="url">example: ws://192.168.0.100/els </label>
                <input className="form-control" type="text"
                    name="url"
                    onChange={onChangeHandler}
                    defaultValue={cookie} />
                <br /> 
                <Button type="submit">Submit Connection Url</Button>

            </Form>
            <Button className="error">
                { JSON.stringify(cookie) }
                ws_url {ws_url}
            </Button>

            
        </div>
    );
}
