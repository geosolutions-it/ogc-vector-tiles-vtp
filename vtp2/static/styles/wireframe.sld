<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
    <NamedLayer>
        <Name>wireframe</Name>
        <UserStyle>
            <FeatureTypeStyle>
                <Rule>
                    <Name>wireframe</Name>
                    <LineSymbolizer>
                        <Stroke>
                            <CssParameter name="stroke">#333333</CssParameter>
                            <CssParameter name="stroke-width">0.5</CssParameter>
                        </Stroke>
                    </LineSymbolizer>
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#aaaaaa</CssParameter>
                            <CssParameter name="fill-opacity">0.5</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#333333</CssParameter>
                            <CssParameter name="stroke-width">0.5</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>
                    <PointSymbolizer>
                        <Graphic>
                            <Mark>
                                <WellKnownName>circle</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#aaaaaa</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#333333</CssParameter>
                                </Stroke>
                            </Mark>
                            <Opacity>0.5</Opacity>
                            <Size>8</Size>
                        </Graphic>
                    </PointSymbolizer>
                </Rule>
            </FeatureTypeStyle>
        </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>