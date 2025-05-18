
const DATASETS = {
    videogames : {
        title: "Video Game Sales",
        description: "Top 100 Most Sold Video Games Grouped by Platform",
        url:'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
    },
    movies : {
        title: "Movie Sales",
        description: "Top 100 Highest Grossing Movies Grouped By Genre",
        url:'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
    },
    kickstarter : {
        title: "Kickstarter Pledges",
        description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
        url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
    }
}

const width = 1000;
const height = 600;

const body = d3.select("body");

const svg = d3.select("svg")
.attr('width',width)
.attr('height',height)

const legend = d3.select("#legend").attr('width',width)

const tooltip = body
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")

const color = d3.scaleOrdinal().range(
    [
        "#1f77b4",
        "#aec7e8",
        "#ff7f0e",
        "#ffbb78",
        "#2ca02c",
        "#98df8a",
        "#d62728",
        "#ff9896",
        "#9467bd",
        "#c5b0d5",
        "#8c564b",
        "#c49c94",
        "#e377c2",
        "#f7b6d2",
        "#7f7f7f",
        "#c7c7c7",
        "#bcbd22",
        "#dbdb8d",
        "#17becf",
        "#9edae5",
    ]
);

async function fetchData() {
    let params = new URLSearchParams(document.location.search);
    const data = DATASETS[params.get('data') || 'videogames']
    const url = data.url

    document.getElementById("title").innerHTML = data.title;
    document.getElementById("description").innerHTML = data.description;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }      
        const data = await response.json();
        createTreeMap(data);
        
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        document.getElementById('tree-map').innerHTML = `
            <text x="50%" y="50%" text-anchor="middle">
                Failed to load data. Please try again later.
            </text>`;
    }
}

function createTreeMap(data) {
    svg.selectAll("*").remove();

    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width,height])
        .padding(1)
        (root);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr('class','tile')
        .attr('data-name',d =>d.data.name)
        .attr('data-category',d =>d.data.category)
        .attr('data-value', d =>d.data.value)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.parent.data.name))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
            tooltip
                .style("visibility", "visible")
                .style("top", event.pageY + "px")
                .style("left", event.pageX + "px")
                .html(`
                    
                    <p>Name: ${d.data.name}</p>
                    <p>Category: ${d.data.category}</p>
                    <p>Value:${d.data.value}</p>
                    `
                )
                .attr('data-value',d.data.value)
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });

    // Add text
    cell.append("text")
        .attr("class", "label")
        .selectAll('tspan')
        .data(d => d.data.name.split(/\s/g))
        .enter()
        .append('tspan')
        .attr("x", 6)
        .attr("y", (_d,i)=> 10*i+10*2)
        .text(d => d)
        .attr("font-size", "10px")
        .attr("fill", "#000")

    const categories = root.leaves().map(nodes => nodes.data.category).filter((cat,i,self) => self.indexOf(cat) === i);

    const LEGEND_RECT_SIZE = 20;
    const LEGEND_SPACING = 10;
    const LEGEND_HEIGHT = 150; 
    const ITEMS_PER_ROW = 3;

    legend
        .attr('height', LEGEND_HEIGHT)
        .style('margin-bottom', 20)

    const legendGroup = legend
        .append("g")
        .attr("transform", `translate(${(width/5)*2},0)`)
        .selectAll("g")
        .data(categories)
        .enter()
        .append("g")
        .attr('transform', (d, i) => {
            const row = Math.floor(i / ITEMS_PER_ROW);
            const col = i % ITEMS_PER_ROW;
            return `translate(${col * (LEGEND_RECT_SIZE + LEGEND_SPACING * 8)}, 
                            ${row * (LEGEND_RECT_SIZE + LEGEND_SPACING) + 10})`;
        });

    legendGroup.append('rect')
        .attr('class', 'legend-item')
        .attr("width", LEGEND_RECT_SIZE)
        .attr("height", LEGEND_RECT_SIZE)
        .attr("fill", d => color(d));

    legendGroup.append('text')
        .attr('x', LEGEND_RECT_SIZE + 5)
        .attr('y', LEGEND_RECT_SIZE / 2)
        .attr('dy', '0.35em')
        .text(d => d)
        .attr('font-size', '12px');
}

document.addEventListener('DOMContentLoaded', fetchData);