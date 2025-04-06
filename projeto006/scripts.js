let prevButton = document.getElementById("prev")
let nextButton = document.getElementById('next')
let container = document.querySelector('.container')
let items = container.querySelectorAll('.list .item')
 let indicator = document.querySelector('.indicators')
 let dots = indicator.querySelectorAll('ul li')
 let active=0
 let firstposition = 0
 let lastposition = items.length -1

 item - 0
 item - 1
 item - 2

 nextButton.onclick = () => {
    let itemold = container.querySelector('.list .item .active')
    itemold.classList.remove('active')
    active = active + 1 > lastPosition ? 0 : active + 1
    setSlider()
    items[active].classList.add('active')
    
 }

 prevButton.onclick = () => {
    
 }