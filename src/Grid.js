import React from 'react';
import * as d3 from 'd3';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import './Grid.css';

export default class Grid extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
            gridLength: 600,
            gridSize: 6,
            gridInfo: [],
            padding: 10,
            colorBarInfo: [],
            possibleGrids:[2,3,4,5,6,7,8,9,10],
            paintColor: "white",
        };
    }

    populateColorBarInfo(N, length, padding) {
        var scalingColorBar = d3.scaleLinear()
            .domain([0,N])
            .range([padding, length/2-padding]);

        var colorNames = d3.scaleOrdinal()
            .domain([0,N])
            .range(d3.schemeSet3);

        var colorBars = [];
        for (let i = 0; i < N; i++) {
            var color = {
                "x":scalingColorBar(i),
                "y":padding,
                "size":scalingColorBar(1)-scalingColorBar(0),
                "color":colorNames(i)
            }
            colorBars.push(color);
        }
        return colorBars;
    }

    populateGridInfo(N, length, padding) {
        var scalingGraph = d3.scaleLinear()
            .domain([0, N])
            .range([padding, length-padding]);

        var squares = [];
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                var square = {
                    "id":(N*i) + j,
                    "size":scalingGraph(1)-scalingGraph(0),
                    "x":scalingGraph(j),
                    "y":scalingGraph(i),
                }
            squares.push(square);
            }
        }
        return squares;
    }

    getDropdownButtons(arrayNs, length, padding) {
        return arrayNs.map(N => {
            return <Dropdown.Item onClick={() => this.setState({
                gridSize: N,
                gridInfo: this.populateGridInfo(N, length, padding),
                colorBarInfo: this.populateColorBarInfo(N, length, padding),
            })
            }>
                {N}_
            </Dropdown.Item>
        })
    }

    dragmove(event, d) {
        var curr_x = event.x;
        var curr_y = event.y;
        var scalingGraphInverse = d3.scaleLinear()
            .domain([0, 600])
            .range([0,6])
        var rounded_x = Math.round(scalingGraphInverse(curr_x));
        var rounded_y = Math.round(scalingGraphInverse(curr_y));
        var id = rounded_y * 6 + rounded_x;

        var colorSpecified = d3.select(".colorClicked").size() === 1
        var color = colorSpecified ? d3.select(".colorClicked").style("fill") : "white";
        d3.select(`[id="${id}"]`).style("fill", color)
    }

    handleColorClicked() {
        d3.selectAll(".colorClicked")
            .classed("colorClicked", false)
        d3.select(this)
            .classed("colorClicked", true)
    }

    handleGraphClicked() {
        var isClicked = d3.select(".colorClicked").size() === 1
        var color = isClicked ? d3.select(".colorClicked").style("fill") : "white"
        var isSameColor = d3.select(this).style("fill") === color
        d3.select(this)
            .style("fill", isSameColor ? "white" : color)       
    }

    handleMouseOver() {
        d3.select(this).classed("hovered", true)
    }

    handleMouseOut() {
        d3.select(this).classed("hovered", false)
    }

    componentDidMount() {
        document.title = "Exploring Grids"
        var N = this.state.gridSize;
        var length = this.state.gridLength;
        var padding = this.state.padding;
        this.setState({
            colorBarInfo: this.populateColorBarInfo(N, length, padding),
            gridInfo: this.populateGridInfo(N, length, padding),
        });
    }

    componentDidUpdate() {

        var drag = d3.drag()
            .on("drag", this.dragmove)

        d3.selectAll("svg").remove()

        var container = d3.select(this.myRef.current)
            .append("svg")
            .attr("width", this.state.gridLength)
            .attr("height", this.state.gridLength)
            // .style("border", "solid 1px")
            .classed("container", true)

        var graphContainer = container
            .append("svg")
            .attr("width", this.state.gridLength)
            .attr("height", this.state.gridLength)
        var squares = graphContainer          
            .selectAll("rect")
            .data(this.state.gridInfo)
            .enter()
            .append("rect");
        var squareAttributes = squares
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("width", function (d) { return d.size; })
            .attr("height", function (d) { return d.size; })
            .attr("id", function (d) { return `${d.id}`; })
            .classed("square", true)
        var squareActions = squareAttributes
            .on("mouseover", this.handleMouseOver)
            .on("mouseout", this.handleMouseOut)
            .on("click", this.handleGraphClicked)
            .call(drag)

        var colorsContainer = d3.select(this.myRef.current)
            .append("svg")
            .attr("width", this.state.gridLength/2)
            .attr("height", this.state.colorBarInfo[0].size + 2*this.state.padding)
        var colors = colorsContainer
            .selectAll("rect")
            .data(this.state.colorBarInfo)
            .enter()
            .append("rect")
        var colorAttributes = colors
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("width", function (d) { return d.size; })
            .attr("height", function (d) { return d.size; })
            .style("fill", function (d) { return d.color; })
            .classed("color", true)
        var colorActions = colorAttributes
            .on("mouseover", this.handleMouseOver)
            .on("mouseout", this.handleMouseOut)
            .on("click", this.handleColorClicked)
        return
    }


    render() {        
        return (
            <div>
                <div>
                    <DropdownButton id="dropdown" title="Grid Size">
                        {this.getDropdownButtons(
                            this.state.possibleGrids, 
                            this.state.gridLength,
                            this.state.padding,
                            )
                        }
                    </DropdownButton>
                </div>
                <div ref={this.myRef}>
                </div>
            </div>
        )
    }
}