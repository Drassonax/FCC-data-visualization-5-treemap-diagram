const allColors = [
    '#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', 
    '#b5cf6b', '#c3db9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', 
    '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194'
]

const fader = (color) => d3.interpolateRgb(color, "#fff")(0.2)

const sumBySize = (item) => item.value


const createTreemap = (dataset) => {
    document.getElementById('title').innerText = dataset.name
    let description
    if (dataset.name.includes('ovies')) {
        description = 'Top 100 Highest Grossing Movies Grouped By Genre'
    } else if (dataset.name.includes('ideo')) {
        description = 'Top 100 Most Sold Video Games Grouped by Platform'
    } else if (dataset.name.includes('ickstarter')) {
        description = 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'
    }
    document.getElementById('description').innerText = description


    const width = 1000
    const height = 600
    
    const tooltip = d3.select('#treemap')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)
    
    const svg = d3.select('#treemap')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
    
    const color = d3.scaleOrdinal(allColors.map(fader))
    const treemap = d3.treemap()
        .size([width, height])
        .paddingInner(1)
    
    const root = d3.hierarchy(dataset)
        .eachBefore((d) => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
        .sum(sumBySize)
        .sort((a, b) => b.height - a.height || b.value - a.value)

    treemap(root)
    
    const cell = svg.selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('class', 'group')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`)
        
        cell.append('rect')
        .attr('id', (d) => d.data.id)
        .attr('class', 'tile')
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('fill', (d) => color(d.data.category))
        .on('mouseover', (d) => {
            tooltip.style('opacity', 0.8)
            tooltip.html(`Name: ${d.data.name}<br/>Category: ${d.data.category}<br/>Value: ${d.data.value}`)
                .attr('data-value', d.data.value)
                .style('left', (d3.event.pageX + 10) + "px")
                .style('top', (d3.event.pageY - 30) + "px")
        })
        .on('mouseout', (d) => {
            tooltip.style('opacity', 0)
        })
        
        cell.append('text')
            .attr('class', 'tile-text')
            .selectAll('tspan')
            .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .enter()
            .append('tspan')
            .attr('x', 4)
            .attr('y', (d, i) => 13 + i * 10)
            .text((d) => d)
        
    let categories = root.leaves().map((nodes) => nodes.data.category)
    categories = categories.filter((category, index, array) => array.indexOf(category) === index)
        
    const legend = d3.select('#legend')
    const legendOffset = 10
    const legendRectSize = 15
    const legendHSpacing = 100
    const legendVSpacing = 10
    const legendTextXOffset = 3
    const legendTextYOffset = -2
    const legendElemsPerRow = 3
    
    const legendElem = legend.append('g')
        .attr('transform', `translate(20, ${legendOffset})`)
        .selectAll('g')
        .data(categories)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate (${(i % legendElemsPerRow) * legendHSpacing}, ${Math.floor(i / legendElemsPerRow) * legendRectSize + legendVSpacing * Math.floor(i / legendElemsPerRow)})`)
     
    legendElem.append('rect')                              
        .attr('width', legendRectSize)                          
        .attr('height', legendRectSize)     
        .attr('class', 'legend-item')                 
        .attr('fill', (d) => color(d))
        
    legendElem.append('text')                              
        .attr('x', legendRectSize + legendTextXOffset)                          
        .attr('y', legendRectSize + legendTextYOffset)                       
        .text((d) => d)
    }

const chooseDataset = (url) => {
    document.getElementById('title').innerHTML = ''
    document.getElementById('description').innerHTML = ''
    document.getElementById('legend').innerHTML = ''
    document.getElementById('treemap').innerHTML = ''
    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            createTreemap(data)
        })
    }


document.getElementById('video-games').addEventListener('click', () => {
    chooseDataset('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json')
})
document.getElementById('movies').addEventListener('click', () => {
    chooseDataset('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json')
})
document.getElementById('kickstarter').addEventListener('click', () => {
    chooseDataset('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json')
})

chooseDataset('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json')