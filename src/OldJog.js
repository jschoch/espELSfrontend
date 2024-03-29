





export default function OldJob({ config, stats, ws }) {
  const onSubmitJog = (data) => {
    // TODO: pull this out 
    var c = config
    c.f = feedingLeft;
    c.s = syncStart;
    if (submitButton == 1) {
      c.jm = data.jog_mm;
      setConfig(c);
      jog();
    } else if (submitButton == -1) {
      c.jm = Math.abs(data.jog_mm) * -1;
      setConfig(c);
      jog();
    }
    console.log("onSubmitJog data", data, c, submitButton);
  }

  const onSubmitRapid = data => {
    var c = config
    c.f = feedingLeft;
    c.s = syncStart;
    c.rapid = data.rapid
    setConfig(c);
    console.log("range submit data", data);
    sendConfig();
  }
  const onSubmitJogScaler = data => {
    var c = config
    c.sc = data.sc
    setConfig(c);
    console.log("Jog Scaler submit data", data);
    sendConfig();
  }




  return (
    <Tab eventKey="jog_tab" title="Jog" >
      <div>
        <div className="card-body">
          {stats["pos_feed"] &&
            <Moving stats={stats} ws={ws} />
          }

          {showJog && !stats["pos_feed"] && !stats["sw"] &&
            <div>
              { /*  TODO: add this stuff back in but refactor it
              <Form inline >
                <Form.Row>
                  <Col>
                      <Form.Check inline type="checkbox" label="Feed CCW" 
                        name="feeding_left" ref={register({required: false})} 
                        id="feeding_left"
                        checked={feedingLeft}
                        onChange ={ () => setFeedingLeft(!feedingLeft)} />
                  </Col>
                  <Col>
                      <Form.Check inline type="checkbox" label="Sync Start"
                        name="syncStart" ref={register({required: false})}
                        id="syncStart"
                        checked={syncStart}
                        onChange ={ () => setSyncStart(!syncStart)} />
                  </Col>
                  
                </Form.Row>
              </Form>
              <Form inline onSubmit={handleSubmit(onSubmitJog)} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} >
                <Form.Row>
                <span>Incremental</span>
                <InputGroup className="mb-2 mr-sm-2">

                <Col xs={2}>
                <Button type="submit" className="mb-2 mr-sm-2" 
                  disabled={stats.pos_feed}
                  onClick={() => setSubmitButton(-1)}>
                  Jog Z- 
                </Button>
                </Col>
                <Col xs={8}>
                <InputGroup.Prepend className="inputGroup-sizing-xs">
                    <InputGroup.Text>Jog <br />mm:</InputGroup.Text>
                     <Form.Control id="jog_mm" name="jog_mm" type="number" 
                      ref={register({ required: true })}
                      inputMode='decimal' step='any' defaultValue={Math.abs(config.jm)} />
                
                  </InputGroup.Prepend>
                 </Col>

                  <Col xs={2}>
                  <Button type="submit" className="mb-2" 
                    disabled={stats.pos_feed}
                    onClick={() => setSubmitButton(1)}>
                    Jog Z+
                  </Button>
                  </Col>
                </InputGroup>
                </Form.Row>
              </Form>
              */
              }


              <MoveSyncAbs config={config} stats={stats} ws={ws} />
            </div>
          }
        </div>
        <div className="card-body">
          <Form inline onSubmit={handleSubmit(onSubmitPitch)} >
            <Form.Row>
              <InputGroup className="mb-2 mr-sm-2">
                <Col xs={8}>
                  <InputGroup.Prepend>
                    <InputGroup.Text>Pitch: {config["pitch"]}</InputGroup.Text>
                    <Form.Control id="pitch" name="pitch" type="number"
                      ref={register({ required: true })}
                      defaultValue="0.1"
                      inputMode='decimal' step='any' placeholder="1.0" />
                  </InputGroup.Prepend>
                </Col>

                <Col>
                  <Button type="submit" className="mb-2">
                    Change Pitch!
                  </Button>
                </Col>
              </InputGroup>
            </Form.Row>
          </Form>

          {showRapid &&
            <div>
              <Form onSubmit={handleSubmit(onSubmitRapid)}>
                <div className="row row-cols-lg-auto g-3 align-items-center">
                  <div className="col-12">
                    <RangeSlider name="Rapid" defaultValue={config.rapid} register={register} />
                  </div>

                </div>
              </Form>
            </div>

          }
          {showRapid &&
            <div>
              <Form inline onSubmit={handleSubmit(onSubmitJogScaler)} >
                <InputGroup className="mb-2 mr-sm-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>Jog Scaler</InputGroup.Text>
                    <Form.Control id="sc" name="sc" type="number"
                      ref={register({ required: true })}
                      defaultValue="0.5"
                      inputMode='decimal' step='any' placeholder="1.0" />
                  </InputGroup.Prepend>
                  <Button type="submit" className="mb-2">
                    Update Jog Scaler Hack!
                  </Button>
                </InputGroup>
              </Form>
            </div>
          }

          <span className="card-text">
            {config["m"] == 0 &&
              <h4>
                Select a mode to get started!
              </h4>
            }

          </span>

        </div>
        <div>

        </div>
      </div>
    </Tab>
  )
}
