<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>AgricultureSrf</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>F_CODE</PropertyName>
              <Literal>EA010</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#039859</CssParameter>
              <CssParameter name="fill-opacity">0.2</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>VegetationSrf</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <Title>Woods.</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>F_CODE</PropertyName>
              <Literal>EC015</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <MaxScaleDenominator>1000000.0</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#C2E4B9</CssParameter>
              <CssParameter name="fill-opacity">0.5</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>SettlementSrf</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <Title>Built Up Area</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>F_CODE</PropertyName>
              <Literal>AL020</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#E8C3B2</CssParameter>
              <CssParameter name="fill-opacity">0.4</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>MilitarySrf</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#f3602f</CssParameter>
              <CssParameter name="fill-opacity">0.5</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>CultureSrf</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ab92d2</CssParameter>
              <CssParameter name="fill-opacity">0.5</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>HydrographyCrv</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <Title>River, Permanent</Title>
          <Filter>

            <PropertyIsEqualTo>
              <PropertyName>F_CODE</PropertyName>
              <Literal>BH140</Literal>
            </PropertyIsEqualTo>

          </Filter>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#00A0C6</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
              <CssParameter name="stroke-opacity">0.7</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>HydrographySrf</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <Title>Lake</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>F_CODE</PropertyName>
              <Literal>BH082</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#B0E1ED</CssParameter>
              <CssParameter name="fill-opacity">0.7</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#00A0C6</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
              <CssParameter name="stroke-opacity">0.7</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>TransportationGroundCrv</Name>
    <UserStyle>
      <Name>Default Styler</Name>


      <FeatureTypeStyle>
        <Rule>
          <Title>Bridge</Title>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AQ040</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>TRS</PropertyName>
                <Literal>13</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">12</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
      <FeatureTypeStyle>
        <Rule>
          <Title>Bridge</Title>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AQ040</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>TRS</PropertyName>
                <Literal>13</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">10</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>


      <FeatureTypeStyle>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>2500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2.5E7</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">1.14</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100000.0</MinScaleDenominator>
          <MaxScaleDenominator>500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>5000.0</MinScaleDenominator>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">6.3</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100.0</MinScaleDenominator>
          <MaxScaleDenominator>5000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">12</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>2500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2.5E7</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">1.14</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100000.0</MinScaleDenominator>
          <MaxScaleDenominator>500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>5000.0</MinScaleDenominator>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">6.3</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100.0</MinScaleDenominator>
          <MaxScaleDenominator>5000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">12</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <VendorOption name="ruleEvaluation">first</VendorOption>
      </FeatureTypeStyle>
      <FeatureTypeStyle>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>2500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2.5E7</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ff0000</CssParameter>
              <CssParameter name="stroke-width">0.9</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ff0000</CssParameter>
              <CssParameter name="stroke-width">1.14</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100000.0</MinScaleDenominator>
          <MaxScaleDenominator>500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ff0000</CssParameter>
              <CssParameter name="stroke-width">2.25</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>5000.0</MinScaleDenominator>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ff0000</CssParameter>
              <CssParameter name="stroke-width">4.655</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>3</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100.0</MinScaleDenominator>
          <MaxScaleDenominator>5000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ff0000</CssParameter>
              <CssParameter name="stroke-width">8</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>2500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2.5E7</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#cb171a</CssParameter>
              <CssParameter name="stroke-width">0.9</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#cb171a</CssParameter>
              <CssParameter name="stroke-width">1.14</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100000.0</MinScaleDenominator>
          <MaxScaleDenominator>500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#cb171a</CssParameter>
              <CssParameter name="stroke-width">2.25</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>5000.0</MinScaleDenominator>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#cb171a</CssParameter>
              <CssParameter name="stroke-width">4.655</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>4</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100.0</MinScaleDenominator>
          <MaxScaleDenominator>5000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#cb171a</CssParameter>
              <CssParameter name="stroke-width">8</CssParameter>
              <CssParameter name="stroke-opacity">0.6</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>5</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>2500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2.5E7</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">0.675</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>5</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>500000.0</MinScaleDenominator>
          <MaxScaleDenominator>2500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">0.855</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>5</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100000.0</MinScaleDenominator>
          <MaxScaleDenominator>500000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">1.2</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>5</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>5000.0</MinScaleDenominator>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">2.491</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <And>
              <PropertyIsEqualTo>
                <PropertyName>F_CODE</PropertyName>
                <Literal>AP030</Literal>
              </PropertyIsEqualTo>
              <PropertyIsEqualTo>
                <PropertyName>RIN_ROI</PropertyName>
                <Literal>5</Literal>
              </PropertyIsEqualTo>
            </And>
          </Filter>
          <MinScaleDenominator>100.0</MinScaleDenominator>
          <MaxScaleDenominator>5000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">6</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <PropertyIsNotEqualTo>
              <PropertyName>ZI005_FNA</PropertyName>
              <Literal>No Information</Literal>
            </PropertyIsNotEqualTo>
          </Filter>
          <TextSymbolizer>
            <Label>
              <PropertyName>ZI005_FNA</PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Arial</CssParameter>
              <CssParameter name="font-size">12</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
              <CssParameter name="fill-opacity">1.0</CssParameter>
            </Fill>
            <Halo>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
                <CssParameter name="fill-opacity">1.0</CssParameter>
              </Fill>
              <Radius>2</Radius>
            </Halo>
            <VendorOption name="followLine">true</VendorOption>
          </TextSymbolizer>
        </Rule>
        <VendorOption name="ruleEvaluation">first</VendorOption>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>


  <NamedLayer>
    <Name>UtilityInfrastructureCrv</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <FeatureTypeStyle>
        <Rule>
          <Title>Powerline, Non Obstruction</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>F_CODE</PropertyName>
              <Literal>AT005</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <MaxScaleDenominator>200000.0</MaxScaleDenominator>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <VendorOption name="ruleEvaluation">first</VendorOption>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>



  <NamedLayer>
    <Name>CulturePnt</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <Title>Building, General, Building, Mosque</Title>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <PointSymbolizer>
            <Graphic>
              <ExternalGraphic>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="/static/mapstorestyle/sprites/mosque_b.svg"
                />
                <Format>image/svg</Format>
              </ExternalGraphic>
              <Size>22</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>StructurePnt</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <Title>Building, General, Building, Mosque</Title>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <PointSymbolizer>
            <Graphic>
              <ExternalGraphic>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="/static/mapstorestyle/sprites/square_b.svg"
                />
                <Format>image/svg</Format>
              </ExternalGraphic>
              <Size>12</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        <Rule>
          <Filter>
            <PropertyIsNotEqualTo>
              <PropertyName>ZI005_FNA</PropertyName>
              <Literal>No Information</Literal>
            </PropertyIsNotEqualTo>
          </Filter>
          <TextSymbolizer>
            <Label>
              <PropertyName>ZI005_FNA</PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Arial</CssParameter>
              <CssParameter name="font-size">14</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>
            <LabelPlacement>
              <PointPlacement>
                <Displacement>
                  <DisplacementX>0</DisplacementX>
                  <DisplacementY>16</DisplacementY>
                </Displacement>
              </PointPlacement>
            </LabelPlacement>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
              <CssParameter name="fill-opacity">1.0</CssParameter>
            </Fill>
            <Halo>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
                <CssParameter name="fill-opacity">1.0</CssParameter>
              </Fill>
              <Radius>2</Radius>
            </Halo>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>UtilityInfrastructurePnt</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <Title>Building, General, Building, Mosque</Title>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <PointSymbolizer>
            <Graphic>
              <ExternalGraphic>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="/static/mapstorestyle/sprites/pylon_wilson_b.svg"
                />
                <Format>image/svg</Format>
              </ExternalGraphic>
              <Size>12</Size>
            </Graphic>
          </PointSymbolizer>
          <TextSymbolizer>
            <Label>
              Pylon
            </Label>
            <Font>
              <CssParameter name="font-family">Arial</CssParameter>
              <CssParameter name="font-size">10</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>
            <LabelPlacement>
              <PointPlacement>
                <Displacement>
                  <DisplacementX>0</DisplacementX>
                  <DisplacementY>12</DisplacementY>
                </Displacement>
              </PointPlacement>
            </LabelPlacement>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
            </Fill>
            <Halo>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
              </Fill>
              <Radius>2</Radius>
            </Halo>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

  <NamedLayer>
    <Name>FacilityPnt</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <MaxScaleDenominator>100000.0</MaxScaleDenominator>
          <PointSymbolizer>
            <Graphic>
              <ExternalGraphic>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="/static/mapstorestyle/sprites/circle_b.svg"
                />
                <Format>image/svg</Format>
              </ExternalGraphic>
              <Size>12</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>

</StyledLayerDescriptor>