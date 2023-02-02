const findTopItems = (displayList, item) => {
  const topFront = displayList.filter(e => {
    const isAxistItm = e.id === item.id
    const isEvRightAxis = (e.left + e.width) >= item.left && (e.left + e.width) <= (item.left + item.width)
    const isEvLeftAxis = e.left >= item.left && e.left <= (item.left + item.width)
    const isItmLeftAxis = (item.left >= e.left) && item.left <= (e.left + e.width)
    const isItmRightAxis = (item.left + item.width) >= e.left && (item.left + item.width) <= (e.left + e.width)
    const isTopItm = item.top > e.top
    return (isTopItm && (isEvRightAxis || isEvLeftAxis || isItmLeftAxis || isItmRightAxis)) || isAxistItm
  })
  return topFront
}
export const findRightItems = (displayList, item) => {
  const rightFrontCollision = displayList.filter(ev => {
    const isId = ev.id === item.id
    const ItmtopLine = (item.top <= ev.top) && (item.top + item.height) >= ev.top
    const ItmBottomLine = (ev.top + ev.height) >= item.top && (ev.top + ev.height) <= (item.top + item.height)
    const evTopLine = item.top >= ev.top && item.top <= (ev.top + ev.height)
    const evBottomLine = (item.top + item.height) >= ev.top && (item.top + item.height) <= (ev.top + ev.height)
    const rightOnly = item.left < ev.left
    return ((ItmtopLine || ItmBottomLine || evTopLine || evBottomLine) && rightOnly) || isId
  })
  return rightFrontCollision
}
export const findBottomItems = (displayList, item) => {
  const bottomFront = displayList.filter(e => {
    const isId = e.id === item.id
    const isEvRightAxis = (e.left + e.width) >= item.left && (e.left + e.width) <= (item.left + item.width)
    const isEvLeftAxis = e.left >= item.left && e.left <= (item.left + item.width)
    const isItmLeftAxis = (item.left >= e.left) && item.left <= (e.left + e.width)
    const isItmRightAxis = (item.left + item.width) >= e.left && (item.left + item.width) <= (e.left + e.width)
    const isTopItm = item.top < e.top
    return ((isEvRightAxis || isEvLeftAxis || isItmLeftAxis || isItmRightAxis) && isTopItm) || isId
  })
  return bottomFront
}
const findLeftItems = (displayList, item) => {
  const leftItems = displayList.filter(ev => {
    const isId = ev.id === item.id
    const ItmtopLine = (item.top <= ev.top) && (item.top + item.height) >= ev.top
    const ItmBottomLine = (ev.top + ev.height) >= item.top && (ev.top + ev.height) <= (item.top + item.height)
    const evTopLine = item.top >= ev.top && item.top <= (ev.top + ev.height)
    const evBottomLine = (item.top + item.height) >= ev.top && (item.top + item.height) <= (ev.top + ev.height)
    const isLeftItem = ev.left < item.left
    return ((ItmtopLine || ItmBottomLine || evTopLine || evBottomLine) && isLeftItem) || isId
  })
  return leftItems
}

const YAxisCollision = (displayList, topItem, bottomItem, item) => {
  const topSpace = ((topItem.top + topItem.height) - item.top)
  const topItems = findTopItems(displayList, topItem).filter(e => e.id !== item.id).map(e => ({...e, top: e.top - topSpace}))
  const bottomSpace = (item.top + item.height) - bottomItem.top 
  const bottomitems = findBottomItems(displayList, bottomItem).filter(e => e.id !== item.id).map(e => ({...e, top: e.top + bottomSpace}))
  const mergArry = [...topItems, ...bottomitems]
  const fnlDisplay = displayList.map(e => ({ ...e, top: mergArry.find(ev => ev.id === e.id) ? mergArry.find(ev => ev.id === e.id).top : e.top }))
  return fnlDisplay
}
const XAxisCollision = (displayList, leftItem, rightItem, item) => {
  const leftSpace = (leftItem.left + leftItem.width) - item.left
  const leftItems = findLeftItems(displayList, leftItem).filter(e => e.id !== item.id).map(e => ({...e, left: e.left - leftSpace}))
  const rightSpace = (item.left + item.width) - rightItem.left
  const rightItems = findRightItems(displayList, rightItem).filter(e => e.id !== item.id).map(e => ({...e, left: e.left + rightSpace}))
  const mergArry = [...leftItems, ...rightItems]
  const fnlDisplay = displayList.map(e => ({ ...e, left: mergArry.find(ev => ev.id === e.id) ? mergArry.find(ev => ev.id === e.id).left : e.left }))
  return fnlDisplay
}

export const setCollision = (withoutCurrentItem, item, top, left, displays) => {
    let displaysCopy = [...displays];
    const isTopLeftCorner = withoutCurrentItem.find(e => {
      const leftLine = left >= e.left && (left <= e.left + e.width)
      const topLine = top >= e.top && (top <= (e.top + e.height))
      return leftLine && topLine
    })
    const isTopRightCorner = withoutCurrentItem.find(e => {
      const topLine = top >= e.top && (top <= (e.top + e.height))
      const rightLine = (left + item.width) >= e.left && (left + item.width) <= (e.left + e.width)
      return topLine && rightLine
    })
    const isBottomRightCorner = withoutCurrentItem.find(e => {
      const rightLine = (left + item.width) >= e.left && (left + item.width) <= (e.left + e.width)
      const bottomLine = (top + item.height) >= e.top && (top + item.height) <= (e.top + e.height)
      return rightLine && bottomLine
    })
    const isBottomLeftCorner = withoutCurrentItem.find(e => {
      const bottomLine = (top + item.height) >= e.top && (top + item.height) <= (e.top + e.height)
      const leftLine = left >= e.left && (left <= e.left + e.width)
      return bottomLine && leftLine
    })

    const isLeftTopNBottom = isTopLeftCorner && isBottomLeftCorner && (isTopLeftCorner.id !== isBottomLeftCorner.id)
    const isRightTopNBottom = isTopRightCorner && isBottomRightCorner && (isTopRightCorner.id !== isBottomRightCorner.id)
    const isLeftTopNRightBottom = isTopLeftCorner && isBottomRightCorner && (isTopLeftCorner.id !== isBottomRightCorner.id) && !isLeftTopNBottom && !isRightTopNBottom
    const isRightTopNLeftBottom = isTopRightCorner && isBottomLeftCorner && (isTopRightCorner.id !== isBottomLeftCorner.id) && !isLeftTopNBottom && !isRightTopNBottom
    
    const isTopLeftNRight = isTopLeftCorner && isTopRightCorner && (isTopLeftCorner.id !== isTopRightCorner.id) && !isLeftTopNBottom && !isRightTopNBottom && !isLeftTopNRightBottom && !isRightTopNLeftBottom
    const isBottomLeftNRight = isBottomLeftCorner && isBottomRightCorner && (isBottomLeftCorner.id !== isBottomRightCorner.id) && !isLeftTopNBottom && !isRightTopNBottom && !isLeftTopNRightBottom && !isRightTopNLeftBottom

    const isTopNBottom = withoutCurrentItem.find(e => {
      const bottomLine = (top + item.height) >= e.top && (top + item.height) <= (e.top + e.height)
      const topLine = top >= e.top && (top <= (e.top + e.height))
      return bottomLine && topLine
    })

    const isLeftNRight = withoutCurrentItem.find(e => {
      const rightLine = (left + item.width) >= e.left && (left + item.width) <= (e.left + e.width)
      const leftLine = left >= e.left && (left <= e.left + e.width)
      return rightLine && leftLine
    })

    // double collisiision start
    if(isLeftTopNBottom) {
      if((isTopLeftCorner.id !== isBottomLeftCorner.id)) {
        const fnlDisplay = YAxisCollision(displaysCopy, isTopLeftCorner, isBottomLeftCorner, item)
        displaysCopy = [...fnlDisplay]
      }
    }
    if(isRightTopNBottom) {
      if((isTopRightCorner.id !== isBottomRightCorner.id)) {
        const fnlDisplay = YAxisCollision(displaysCopy, isTopRightCorner, isBottomRightCorner, item)
        displaysCopy = [...fnlDisplay]
      }
    }
    if(isLeftTopNRightBottom) {
      const fnlDisplay = YAxisCollision(displaysCopy, isTopLeftCorner, isBottomRightCorner, item)
      displaysCopy = [...fnlDisplay]
    }
    if(isRightTopNLeftBottom) {
      const fnlDisplay = YAxisCollision(displaysCopy, isTopRightCorner, isBottomLeftCorner, item)
      displaysCopy = [...fnlDisplay]
    }
    if(isTopLeftNRight) {
      const fnlDisplay = XAxisCollision(displaysCopy, isTopLeftCorner, isTopRightCorner, item)
      displaysCopy = [...fnlDisplay]
    }
    if(isBottomLeftNRight) {
      const fnlDisplay = XAxisCollision(displaysCopy, isBottomLeftCorner, isBottomRightCorner, item)
      displaysCopy = [...fnlDisplay]
    }
    // double collisiision end

    // single collisiision start
    if(isTopLeftCorner && !isLeftTopNBottom && !isTopLeftNRight) {
      const isLeft = (isTopLeftCorner.left + isTopLeftCorner.width - item.left) / item.width * 100
      const isBottom = (isTopLeftCorner.top + isTopLeftCorner.height - item.top) / item.height * 100
      if(isLeft < isBottom) {
        const leftFrontCollision = findLeftItems(displaysCopy, isTopLeftCorner).filter(e => e.id !== item.id)
        const XSpace = isTopLeftCorner.left + isTopLeftCorner.width - item.left
        const fnlDisplay = displaysCopy.map(e => ({ ...e, left: leftFrontCollision.find(ev => ev.id === e.id) ? (e.left - XSpace) : e.left  }))
        displaysCopy = [...fnlDisplay]
      } else {
        const topFront = findTopItems(displaysCopy, isTopLeftCorner).filter(e => e.id !== item.id)
        const XSpace = isTopLeftCorner.top + isTopLeftCorner.height - item.top
        const fnlDisplay = displaysCopy.map(e => ({ ...e, top: topFront.find(ev => ev.id === e.id) ? (e.top - XSpace) : e.top }))
        displaysCopy = [...fnlDisplay]
      }
    }

    if(isTopRightCorner && !isRightTopNBottom && !isTopLeftNRight) {
      const isId = isTopLeftCorner ? isTopLeftCorner : {id: ''}
      if(isTopRightCorner.id !== isId.id) {
        const isRight = ((item.left + item.width) - (isTopRightCorner.left - 1)) / item.width * 100
        const isTop = ((isTopRightCorner.top + isTopRightCorner.height) - item.top) / item.height * 100
        if(isTop > isRight) {
          const rightFrontCollision = findRightItems(displaysCopy, isTopRightCorner).filter(e => e.id !== item.id)
          const XSpace = (item.left + item.width) - (isTopRightCorner.left - 1)
          const fnlDisplay = displaysCopy.map(e => ({ ...e, left: rightFrontCollision.find(ev => ev.id === e.id) ? e.left + XSpace : e.left }))
          displaysCopy = [...fnlDisplay]
        } else {
          const topFront = findTopItems(displaysCopy, isTopRightCorner).filter(e => e.id !== item.id)
          const XSpace = (isTopRightCorner.top + isTopRightCorner.height) - item.top
          const fnlDisplay = displaysCopy.map(e => ({ ...e, top: topFront.find(ev => ev.id === e.id) ? (e.top - XSpace) : e.top }))
          displaysCopy = [...fnlDisplay]
        }
      }
    }

    if(isBottomRightCorner && !isRightTopNBottom && !isBottomLeftNRight) {
      const isId = isTopRightCorner ? isTopRightCorner : isBottomLeftCorner ? isBottomLeftCorner : {id: ''}
      if(isId.id !== isBottomRightCorner.id) {
        const isRight = ((item.left + item.width) - (isBottomRightCorner.left)) / item.width * 100
        const isBottom = ((item.top + item.height) - isBottomRightCorner.top) / item.height * 100
        if(isRight < isBottom) {
          const rightFrontCollision = findRightItems(displaysCopy, isBottomRightCorner).filter(e => e.id !== item.id)
          const XSpace = (item.left + item.width) - (isBottomRightCorner.left)
          const fnlDisplay = displaysCopy.map(e => ({ ...e, left: rightFrontCollision.find(ev => ev.id === e.id) ? e.left + XSpace + 1 : e.left }))
          displaysCopy = [...fnlDisplay]
        } else {
          const bottomFrontCollision = findBottomItems(displaysCopy, isBottomRightCorner).filter(e => e.id !== item.id)
          const XSpace = (item.top + item.height) - isBottomRightCorner.top
          const fnlDisplay = displaysCopy.map(e => ({ ...e, top: bottomFrontCollision.find(ev => ev.id === e.id) ? e.top + XSpace + 1 : e.top }))
          displaysCopy = [...fnlDisplay]
        }
      }
    }

    if(isBottomLeftCorner && !isLeftTopNBottom && !isBottomLeftNRight) {
      const isId = isTopLeftCorner ? isTopLeftCorner : {id: ''}
      if(isId.id !== isBottomLeftCorner.id) {
        const isLeft = ((isBottomLeftCorner.left + isBottomLeftCorner.width) - item.left) / item.width * 100
        const isTop = ((item.top + item.height) - isBottomLeftCorner.top) / item.height * 100
        if(isLeft < isTop) {
          const leftFrontCollision = findLeftItems(displaysCopy, isBottomLeftCorner).filter(e => e.id !== item.id)
          const XSpace = isBottomLeftCorner.left + isBottomLeftCorner.width - item.left
          const fnlDisplay = displaysCopy.map(e => ({ ...e, left: leftFrontCollision.find(ev => ev.id === e.id) ? e.left - XSpace : e.left  }))
          displaysCopy = [...fnlDisplay]
        } else {
          const bottomFrontCollision = findBottomItems(displaysCopy, isBottomLeftCorner).filter(e => e.id !== item.id)
          const XSpace = (item.top + item.height) - isBottomLeftCorner.top
          const fnlDisplay = displaysCopy.map(e => ({ ...e, top: bottomFrontCollision.find(ev => ev.id === e.id) ? e.top + XSpace : e.top }))
          displaysCopy = [...fnlDisplay]
        }
      }
    }
    // single collisiision end

    // ev Collision
    const isTopAxis = withoutCurrentItem.find(e => {
      const leftLine = item.left <= e.left && ((item.left + item.width) >= e.left)
      const topLine = item.top <=  e.top && ((item.top + item.height) >= e.top)
      const rightLine = (item.left <= (e.left + e.width)) && ((item.left + item.width) >= (e.left + e.width))
      return leftLine && topLine && rightLine
    })
    const isRightAxis = withoutCurrentItem.find(e => {
      const topLine = (item.top <= e.top) && ((item.top + item.height) >= e.top)
      const rightLine = (item.left <= (e.left + e.width)) && ((item.left + item.width) >= (e.left + e.width))
      const bottomLine = ((item.top + item.height) >= (e.top + e.height)) && (item.top <= (e.top + e.height))
      return topLine && rightLine && bottomLine
    })
    const isBottomAxis = withoutCurrentItem.find(e => {
      const rightLine = (item.left <= (e.left + e.width)) && ((item.left + item.width) >= (e.left + e.width))
      const bottomLine = ((item.top + item.height) >= (e.top + e.height)) && (item.top <= (e.top + e.height))
      const leftLine = (item.left <= e.left) && ((item.left + item.width) >= e.left)
      return rightLine && bottomLine && leftLine
    })
    const isLeftAxis = withoutCurrentItem.find(e => {
      const bottomLine = (item.top + item.height) >= (e.top + e.height) && item.top <= (e.top + e.height)
      const leftLine = (item.left <= e.left) && ((item.left + item.width) >= e.left)
      const topLine = (item.top <= e.top) && ((item.top + item.height) >= e.top)
      return bottomLine && leftLine && topLine
    })

    if(isTopAxis && !isRightAxis) {
      const bottomFront = findBottomItems(displaysCopy, isTopAxis).filter(e => e.id !== item.id)

      let XSpace = (item.top + item.height + 1)
      let topSorting = bottomFront.sort((n, p) => n.top - p.top)
      for(let i=0; topSorting.length > i; i++) {
        topSorting[i].top = XSpace
        XSpace = topSorting[i].top + topSorting[i].height
      }
      const fnlDisplay = displaysCopy.map(e => ({ ...e, top: topSorting.find(ev => ev.id === e.id) ? topSorting.find(ev => ev.id === e.id).top : e.top  }))
      displaysCopy = [...fnlDisplay]
    }

    if(isRightAxis) {
      const leftFronCollision = findLeftItems(displaysCopy, isRightAxis).filter(e => e.id !== item.id)
      const XSpace = (isRightAxis.left + isRightAxis.width + 1) - item.left
      const fnlDisplay = displaysCopy.map(e => ({ ...e, left: leftFronCollision.find(ev => ev.id === e.id) ? (e.left - XSpace) : e.left  }))
      displaysCopy = [...fnlDisplay]
    }
    if((isBottomAxis && !isRightAxis)) {
      const topFront = findTopItems(displaysCopy, isBottomAxis).filter(e => e.id !== item.id)
      const XSpace = (isBottomAxis.top + isBottomAxis.height + 1) - item.top
      const fnlDisplay = displaysCopy.map(e => ({ ...e, top: topFront.find(ev => ev.id === e.id) ? e.top - XSpace : e.top  }))
      displaysCopy = [...fnlDisplay]
    }

    if(isLeftAxis && !isRightAxis) {
      const rightFronCollision = findRightItems(displaysCopy, isLeftAxis).filter(e => e.id !== item.id)
      const XSpace = (item.left + item.width) - isLeftAxis.left
      const fnlDisplay = displaysCopy.map(e => ({ ...e, left: rightFronCollision.find(ev => ev.id === e.id) ? (e.left + XSpace + 1) : e.left  }))
      displaysCopy = [...fnlDisplay]
    }

    if(isTopNBottom) {
      const topFront = findTopItems(displaysCopy, isTopNBottom).filter(e => e.id !== item.id)
      const XSpace = (isTopNBottom.top + isTopNBottom.height + 1) - item.top
      const fnlDisplay = displaysCopy.map(e => ({ ...e, top: topFront.find(ev => ev.id === e.id) ? e.top - XSpace : e.top  }))
      displaysCopy = [...fnlDisplay]
    }

    if(isLeftNRight) {
      const rightFronCollision = findRightItems(displaysCopy, isLeftNRight).filter(e => e.id !== item.id)
      const XSpace = (item.left + item.width) - isLeftNRight.left
      const fnlDisplay = displaysCopy.map(e => ({ ...e, left: rightFronCollision.find(ev => ev.id === e.id) ? (e.left + XSpace + 1) : e.left  }))
      displaysCopy = [...fnlDisplay]
    }

    return { collisionDisplay: displaysCopy, isCollistion: (isTopLeftCorner || isTopRightCorner || isBottomRightCorner || isBottomLeftCorner || isLeftAxis || isTopAxis || isRightAxis || isBottomAxis) }
}

export const removMiddleSpace = (displayList, isCorner, isCollistion) => {
  try{
      let displaysCopy = [...displayList]
      const parent = document.getElementById('dragContainer');
      const XCenterPoint = parent.offsetWidth / 2

      if(displaysCopy.length > 2 || !isCollistion) {
        const XleftItems = displaysCopy.filter(e => (e.left + e.width) < XCenterPoint)
        const XCenterItems = displaysCopy.filter(e => (e.left + e.width) > XCenterPoint && e.left < XCenterPoint)
        const XrightItems = displaysCopy.filter(e => e.left > XCenterPoint)

        if(XleftItems.length) {
          const leftSort = XleftItems.sort((n, p) => p.left - n.left)
          for(let i=0; leftSort.length > i; i++) {
            const isFrontItem = [...XCenterItems, ...XleftItems].filter(ev => {
              const isId = ev.id !== leftSort[i].id

              const ItmtopLine = (leftSort[i].top <= ev.top) && (leftSort[i].top + leftSort[i].height) >= ev.top
              const ItmBottomLine = (ev.top + ev.height) >= leftSort[i].top && (ev.top + ev.height) <= (leftSort[i].top + leftSort[i].height)
              const evTopLine = leftSort[i].top >= ev.top && leftSort[i].top <= (ev.top + ev.height)
              const evBottomLine = (leftSort[i].top + leftSort[i].height) >= ev.top && (leftSort[i].top + leftSort[i].height) <= (ev.top + ev.height)

              return (ItmtopLine || ItmBottomLine || evTopLine || evBottomLine) && isId && leftSort[i].left < ev.left
            })
            if(isFrontItem.length) {
              const leftHigh = Math.min(...isFrontItem.map(e => e.left))
              const leftItmIndx = displaysCopy.findIndex(e => e.id === leftSort[i].id)
              displaysCopy[leftItmIndx].left = leftHigh - leftSort[i].width - 1
            } else {
              const leftItmIndx = displaysCopy.findIndex(e => e.id === leftSort[i].id)
              displaysCopy[leftItmIndx].left = XCenterPoint - leftSort[i].width - 1
            }
          }
        }

        if(XrightItems.length) {
          const rightSort = XrightItems.sort((n, p) => n.left - p.left)
          for(let i=0; rightSort.length > i; i++) {
            const isFrontItem = [...XCenterItems, ...XrightItems].filter(ev => {
              const isId = ev.id !== rightSort[i].id
              const ItmtopLine = (rightSort[i].top <= ev.top) && (rightSort[i].top + rightSort[i].height) >= ev.top
              const ItmBottomLine = (ev.top + ev.height) >= rightSort[i].top && (ev.top + ev.height) <= (rightSort[i].top + rightSort[i].height)
              const evTopLine = rightSort[i].top >= ev.top && rightSort[i].top <= (ev.top + ev.height)
              const evBottomLine = (rightSort[i].top + rightSort[i].height) >= ev.top && (rightSort[i].top + rightSort[i].height) <= (ev.top + ev.height)
              const isTopLineEqual = rightSort[i].top === ev.top
              const isBottomhLineEqual = (rightSort[i].top + rightSort[i].height) === (ev.top + ev.height)
              return (ItmtopLine || ItmBottomLine || evTopLine || evBottomLine || isTopLineEqual || isBottomhLineEqual) && isId && (((ev.left + ev.width) - 2) <= rightSort[i].left)
            }) 
            if(isFrontItem.length) {
              const leftHigh = Math.max(...isFrontItem.map(e => e.left + e.width))
              const leftItmIndx = displaysCopy.findIndex(e => e.id === rightSort[i].id)
              displaysCopy[leftItmIndx].left = leftHigh + 1
            } else {
              const leftItmIndx = displaysCopy.findIndex(e => e.id === rightSort[i].id)
              displaysCopy[leftItmIndx].left = XCenterPoint + 1
            }
          }
        }
      
        const YCenterPoint = parent.offsetHeight / 2
        const YTopItems = displaysCopy.filter(e => (e.top + e.height) <= YCenterPoint)
        const YCenterItems = displaysCopy.filter(e => (e.top + e.height) > YCenterPoint && e.top <= YCenterPoint)
        const YBottomItems = displaysCopy.filter(e => e.top > YCenterPoint)

        if(YTopItems.length && isCorner) {
          const topSort = YTopItems.sort((n, p) => p.top - n.top)
          for(let i=0; topSort.length > i; i++) {
            const isBottomFrontItem = [...YCenterItems, ...YTopItems].filter(e => {
              const isId = e.id !== topSort[i].id
              const isLeft = topSort[i].left >= e.left && topSort[i].left <= (e.left + topSort[i].width)
              const isRight = (topSort[i].left + topSort[i].width) >= e.left && (topSort[i].left + topSort[i].width) <= (e.left + e.width)
              const isItemLeft = e.left >= topSort[i].left && e.left <= (topSort[i].left + topSort[i].width)
              const isItemRight = (e.left + e.width) >= topSort[i].left && (e.left + e.width) <= (topSort[i].left + topSort[i].width)
              const onlyBottomItems = ((topSort[i].top + topSort[i].height) - 2) <= e.top
              return isId && onlyBottomItems && (isLeft || isRight || isItemLeft || isItemRight)
            })
            if(isBottomFrontItem.length) {
              const topMin = Math.min(...isBottomFrontItem.map(e => e.top))
              const leftItmIndx = displaysCopy.findIndex(e => e.id === topSort[i].id)
              displaysCopy[leftItmIndx].top = topMin - topSort[i].height
            } else {
              const leftItmIndx = displaysCopy.findIndex(e => e.id === topSort[i].id)
              displaysCopy[leftItmIndx].top = YCenterPoint - topSort[i].height
            }
          }
        }

        if(YBottomItems.length && isCorner) {
          const bottomSort = YBottomItems.sort((n, p) => n.top - p.top)
          for(let i=0; bottomSort.length > i; i++) {
            const isTopFrontItem = displaysCopy.filter(e => {
              const isId = e.id !== bottomSort[i].id
              const itemLeftPos = bottomSort[i].left >= e.left && bottomSort[i].left <= (e.left + e.width)
              const itemRightPos = e.left <= (bottomSort[i].left + bottomSort[i].width) && (e.left + e.width) >= (bottomSort[i].left + bottomSort[i].width)
              const isELeft = e.left >= bottomSort[i].left && e.left <= (bottomSort[i].left + bottomSort[i].width)
              const isERight = (e.left + e.width) >= bottomSort[i].left && (e.left + e.width) <= (bottomSort[i].left + bottomSort[i].width)
              const onlyTopItems = (bottomSort[i].top) > e.top
              return isId && onlyTopItems && (itemLeftPos || itemRightPos || isELeft || isERight)
            })
            if(isTopFrontItem.length) {
              const topHigh = Math.max(...isTopFrontItem.map(e => e.top + e.height))
              const leftItmIndx = displaysCopy.findIndex(e => e.id === bottomSort[i].id)
              displaysCopy[leftItmIndx].top = topHigh + 1
            } else {
              const leftItmIndx = displaysCopy.findIndex(e => e.id === bottomSort[i].id)
              displaysCopy[leftItmIndx].top = YCenterPoint
            }
          }
        }
      }
      const centerDisplay = setCenterAlign(displaysCopy)
      return centerDisplay
    } catch(err) {

    }
  }

  export const setCenterAlign = (displays) => {
    const parent = document.getElementById('dragContainer');

    // <--set-X-center-direction-start-->
    const XCenterPoint = parent.offsetWidth / 2
    const minLeft = Math.min(...displays.map(e => e.left))
    const maxRight = Math.max(...displays.map(e => e.left + e.width))
    const XCenterSpace = maxRight - minLeft
    const halfXCenterSpace = XCenterSpace / 2
    const leftPosition = XCenterPoint - halfXCenterSpace
    const XCenterDirection = leftPosition - minLeft
    // <--set-X-center-direction-end-->

    // <--set-Y-center-direction-start-->
    const YCenterPoint = parent.offsetHeight / 2
    const minTop = Math.min(...displays.map(e => e.top))
    const maxBottom = Math.max(...displays.map(e => e.top + e.height))
    const YCenterSpace = maxBottom - minTop
    const halfYCenterSpace = YCenterSpace / 2
    const topPosition = YCenterPoint - halfYCenterSpace
    const YCenterDirection = topPosition - minTop
    // <--set-Y-center-direction-end-->
    for(let i=0; i < displays.length; i++){
      displays[i]['left'] = displays[i]['left'] + XCenterDirection
      displays[i]['top'] = displays[i]['top'] + YCenterDirection
    }
    return displays

    //return displays.map(e => ({...e, left: e.left + XCenterDirection, top: e.top + YCenterDirection}))

  }


  export const find_screen_position = (display1, display2) => {
    try{
      let location = null

      //on top
      if (Math.floor(display1.top + display1.height) <= Math.floor(display2.top)){
        //check top corners
        if (display1.left + display1.width <= display2.left){
          location = "top-left"
        }
        else if(display1.left >= display2.left + display2.width){
          location = "top-right"
        }
        else{
          location = "top"
        }

      }
      

      //bottom
      else if (Math.floor (display1.top) >= Math.floor(display2.top + display2.height) ){
        //check bottom corners
        if (display1.left + display1.width <= display2.left){
          location = "bottom-left"
        }
        else if (display1.left  >= display2.left + display2.width){
          location = "bottom-right"
        }
        else{
          location = "bottom"
        }
      }

      //left
      else if (Math.floor(display1.left + display1.width) <= Math.floor(display2.left)){
        location = "left"
      }

      //right
      else if (Math.floor(display1.left) >= Math.floor(display2.left + display2.width)){
        location = "right"
      }

      return location

    }catch(err) {

    }
  }

  const measure_distance = (x1, y1, x2, y2) => {
    let a = x1 - x2;
    let b = y1 - y2;
    let c = Math.sqrt( a*a + b*b );

    return {distance: c, x1:x1, y1:y1, x2:x2, y2:y2}
  }

  const checkWhiteSpace = (movingItem, nonMovingDisplays, collision_displays) => {
    const parent = document.getElementById('dragContainer');
    let collision_report = []
    let DLeft = null,
        DTop = null,
        DRight = null,
        DBottom = null,
        minLeft = movingItem.left,
        minTop = movingItem.top,
        maxRight = movingItem.left + movingItem.width,
        maxBottom = movingItem.top + movingItem.height;
    for(let i=0; i < nonMovingDisplays.length; i++){
      let d = nonMovingDisplays[i]
      let newLeft = d.left
      let newTop = d.top
      let newRight = d.left + d.width
      let newBottom = d.top + d.height
      if ((newLeft < minLeft) && (movingItem.top >= d.top && movingItem.top <= d.top + d.height )){
        minLeft = newLeft
      }
      if ((newTop < minTop) && (movingItem.left >= d.left && movingItem.left <= d.left + d.width)){
        minTop = newTop
      }
      if ((newRight > maxRight) && (movingItem.top >= d.top && movingItem.top <= d.top + d.height)){
        maxRight = newRight
      }
      if ((newBottom > maxBottom) && (movingItem.left >= d.left && movingItem.left <= d.left + d.width)){
        maxBottom = newBottom
      }

    }
    

    DLeft = movingItem.left - minLeft
    DTop = movingItem.top - minTop
    DRight = maxRight - movingItem.left - movingItem.width
    DBottom = maxBottom - movingItem.top - movingItem.height

    collision_report = [{distance:DLeft, direction:"left", value:minLeft}, {distance:DTop, direction:"top", value:minTop},{distance:DRight, direction:"right", value:maxRight}, {distance:DBottom, direction:"bottom", value:maxBottom}]
    collision_report = collision_report.sort((a, b) => (a.distance > b.distance) ? 1 : -1) 
    let endFlag = false
    for(let i=0; i <collision_report.length; i++){
      let item = collision_report[i]
      
      if ((item.direction === "left") && (item.value - movingItem.width >= 0)){
        movingItem.left = item.value - movingItem.width
        endFlag = true
        break
      }else if((item.direction === "top") && (item.value - movingItem.height >= 0)){
        movingItem.top = item.value - movingItem.height
        endFlag = true
        break
      }else if ((item.direction === "right") && (item.value + movingItem.width <= parent.offsetWidth)){
        movingItem.left = item.value
        endFlag = true
        break
      }else if ((item.direction === "bottom") && (item.value + movingItem.height <= parent.offsetHeight)){
        movingItem.top = item.value
        endFlag = true
        break
      }
    }
    if(!endFlag){
      for(let i=0; i <collision_report.length; i++){
        let item = collision_report[i]

        if ((item.direction === "left")){
          movingItem.left = item.value - movingItem.width
          break
        }
      }
    }
    nonMovingDisplays.push(movingItem)
   return nonMovingDisplays
  }

  const checkDoubleWhiteSpace = (movingItem, nonMovingDisplays, collision_displays) => {
    const parent = document.getElementById('dragContainer');
    let collision_report = []
    let DLeft = null,
        DTop = null,
        DRight = null,
        DBottom = null,
        minLeft = nonMovingDisplays[0].left,
        minTop = nonMovingDisplays[0].top,
        maxRight = nonMovingDisplays[0].left + nonMovingDisplays[0].width,
        maxBottom = nonMovingDisplays[0].top + nonMovingDisplays[0].height,
        minLeftDisplay = nonMovingDisplays[0],
        minTopDisplay = nonMovingDisplays[0],
        maxRightDisplay = nonMovingDisplays[0],
        maxBottomDisplay = nonMovingDisplays[0];
    for(let i=0; i < nonMovingDisplays.length; i++){
      let d = nonMovingDisplays[i]
      let newLeft = d.left
      let newTop = d.top
      let newRight = d.left + d.width
      let newBottom = d.top + d.height
      if ((newLeft < minLeft)){
        minLeft = newLeft
        minLeftDisplay = d
      }
      if ((newTop < minTop)){
        minTop = newTop
        minTopDisplay = d
      }
      if ((newRight > maxRight)){
        maxRight = newRight
        maxRightDisplay = d
      }
      if ((newBottom > maxBottom) ){
        maxBottom = newBottom
        maxBottomDisplay = d
      }
    }

    DLeft = movingItem.left - minLeft
    DTop = movingItem.top - minTop
    DRight = maxRight - movingItem.left - movingItem.width
    DBottom = maxBottom - movingItem.top - movingItem.height

    collision_report = [{distance:DLeft, direction:"left", value:minLeft, display:minLeftDisplay}, {distance:DTop, direction:"top", value:minTop, display:minTopDisplay},{distance:DRight, direction:"right", value:maxRight, display:maxRightDisplay}, {distance:DBottom, direction:"bottom", value:maxBottom, display:maxBottomDisplay}]
    collision_report = collision_report.sort((a, b) => (a.distance > b.distance) ? 1 : -1) 
    let endFlag = false

    for(let i=0; i <collision_report.length; i++){
      let item = collision_report[i]
      
      if ((item.direction === "left") && (item.value - movingItem.width >= 0)){
        movingItem.left = item.value - movingItem.width
        movingItem.top = item.display.top
        endFlag = true
        break
      }else if((item.direction === "top") && (item.value - movingItem.height >= 0)){
        movingItem.top = item.value - movingItem.height
        movingItem.left = item.display.left
        endFlag = true
        break
      }else if ((item.direction === "right") && (item.value + movingItem.width <= parent.offsetWidth)){
        movingItem.left = item.value
        movingItem.top = item.display.top
        endFlag = true
        break
      }else if ((item.direction === "bottom") && (item.value + movingItem.height <= parent.offsetHeight)){
        movingItem.top = item.value
        movingItem.left = item.display.left
        endFlag = true
        break
      }
    }
    if(!endFlag){
      for(let i=0; i <collision_report.length; i++){
        let item = collision_report[i]

        if ((item.direction === "left")){
          movingItem.left = item.value - movingItem.width
          movingItem.top = item.display.top
          break
        }
      }
    }
    nonMovingDisplays.push(movingItem)
    let otherDisplays = null
    let updated_display = null
    for(let i=0; i < nonMovingDisplays.length; i++){
      otherDisplays = nonMovingDisplays.filter(e => e.id !== nonMovingDisplays[i].id)
      updated_display = connectionCheck(nonMovingDisplays[i], otherDisplays)
    }
    otherDisplays.push(updated_display)
    return otherDisplays

  }

  const connectionCheck = (display, otherDisplays) =>{
    let nearest_display = find_nearst(display, otherDisplays)
    let updated_display = nearest_display["display_updated"]
    return updated_display
  }

  const fullCollisionCheck = (movingItem, nonMovingDisplays, collision_displays) => {
    let collision_report = []
    let DLeft = null,
        DTop = null,
        DRight = null,
        DBottom = null;
    for(let i=0; i < collision_displays.length; i++){
      let d = collision_displays[i]
      //console.log("m", movingItem, d)
      let leftCheck =  ((movingItem.left > d.left) && (movingItem.left < (d.left + d.width)))
      leftCheck ? DLeft=null: DLeft = movingItem.left + movingItem.width - d.left

      let topCheck = ((movingItem.top > d.top) && (movingItem.top < (d.top + d.height)))
      topCheck ? DTop=null: DTop = movingItem.top + movingItem.height - d.top

      let rightCheck = ((movingItem.left + movingItem.width > d.left) && (movingItem.left + movingItem.width) < (d.left + d.width))
      rightCheck ? DRight=null: DRight = d.left + d.width - movingItem.left 

      let bottomCheck = ((movingItem.top + movingItem.height > d.top) && (movingItem.top + movingItem.height) < (d.top + d.height))
      bottomCheck ? DBottom=null: DBottom = d.top + d.height - movingItem.top

      collision_report.push({leftCheck:leftCheck, topCheck:topCheck, rightCheck:rightCheck, bottomCheck:bottomCheck,
        DLeft:DLeft, DTop:DTop, DRight:DRight, DBottom:DBottom})
    }
    return collision_report
  }
  const collisionCheck = (movingItem, nonMovingDisplays, collision_displays) => {
    let collisionReport = fullCollisionCheck(movingItem, nonMovingDisplays, collision_displays)

    if(collision_displays.length === 1){
      let left_d = [],
          top_d = [],
          right_d = [],
          bottom_d = [],
          distance = null,
          exitFlag = false;

          if (!collisionReport[0].leftCheck){
            exitFlag = true
            distance = collisionReport[0].DLeft
            left_d.push({distance:distance, direction:"left"})
            //movingItem.left = movingItem.left - distance
          }
          if(!collisionReport[0].topCheck){
            exitFlag = true
            distance = collisionReport[0].DTop
            top_d.push({distance:distance, direction:"top"})
          }
           if(!collisionReport[0].rightCheck){
            exitFlag = true
            distance = collisionReport[0].DRight
            right_d.push({distance:distance, direction:"right"})            
          }
          if(!collisionReport[0].bottomCheck){
            exitFlag = true
            distance = collisionReport[0].DBottom
            bottom_d.push({distance:distance, direction:"bottom"})           
          }
          if(!exitFlag){
            //all edges are colliding
            let displays = checkWhiteSpace(movingItem, nonMovingDisplays, collision_displays)
            return displays

             
          }else{      
            let dist = []
            if (left_d.length !== 0){
              left_d = left_d.sort((a, b) => (a.distance > b.distance) ? 1 : -1) 
              dist.push(left_d[0])    
            }else{
              dist.push({distance:10000})    
            }
            if (top_d.length !== 0){
              top_d = top_d.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
              dist.push(top_d[0])    
            }else{
              dist.push({distance:10000})    
            }
            if (right_d.length !== 0){
              right_d = right_d.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
              dist.push(right_d[0])    
            }else{
              dist.push({distance:10000})    
            }
            if (bottom_d.length !== 0){
              bottom_d = bottom_d.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
              dist.push(bottom_d[0])    
            }else{
              dist.push({distance:10000})    
            }

            dist = dist.sort((a, b) => (a.distance > b.distance) ? 1 : -1)

            let min_val = dist[0]["distance"]
            let direction = dist[0]["direction"]

            if(direction === "left"){
              movingItem.left = movingItem.left - min_val
            }else if(direction === "top"){
              movingItem.top = movingItem.top - min_val
            }else if(direction === "right"){
              movingItem.left = movingItem.left + min_val
            }else if(direction === "bottom"){
              movingItem.top = movingItem.top + min_val
            }
            let displays = nonMovingDisplays
            displays.push(movingItem)
            return displays

        }
  }
  else{
    let displays = checkDoubleWhiteSpace(movingItem, nonMovingDisplays, collision_displays)
    return displays
  }
}

  export const find_nearst = (display, otherDisplays) => {
    try{
      let top = [],
        bottom = [],
        left = [],
        right = [],
        top_left = [],
        top_right = [],
        bottom_left = [],
        bottom_right =[];
      
      let display_x = display.left
      let display_y = display.top
      let display_width = display.width
      let display_height = display.height

      let distance = null
      let meaurements = null
      let colllision_count = 0
      let colliding_displays = []

      for(let i=0; otherDisplays.length > i; i++){
        let d = otherDisplays[i]
        let loc = find_screen_position(display, d)

        if (loc === "top"){
          distance = d.top - (display_y + display_height)
          top.push({distance: distance, position: "top", id: d.id})
        }
        else if (loc === "bottom"){
          distance = display_y - (d.top + d.height)
          bottom.push({distance: distance, position: "bottom", id: d.id})
        }
        else if(loc === "left"){
          distance = d.left - (display_x + display_width)
          left.push({distance: distance, position: "left", id: d.id})
        }
        else if(loc === "right"){
          distance = display_x - (d.left + d.width)
          right.push({distance: distance, position: "right", id: d.id})
        }
        else if(loc === "top-left"){
            meaurements = measure_distance(display_x + display_width, display_y + display_height, d.left, d.top)
            top_left.push({distance: meaurements['distance'], position: "top-left", id: d.id, x1:meaurements["x1"], y1:meaurements["y1"], x2:meaurements["x2"], y2:meaurements["y2"]})
        }
        else if(loc === "top-right"){
          meaurements = measure_distance(display_x, display_y + display_height, d.left + d.width, d.top)
          top_right.push({distance: meaurements['distance'], position: "top-right", id: d.id, x1:meaurements["x1"], y1:meaurements["y1"], x2:meaurements["x2"], y2:meaurements["y2"]})
        }
        else if(loc === "bottom-left"){
          meaurements = measure_distance(display_x + display_width, display_y , d.left, d.top + d.height)
          top_left.push({distance: meaurements['distance'], position: "bottom-left", id: d.id, x1:meaurements["x1"], y1:meaurements["y1"], x2:meaurements["x2"], y2:meaurements["y2"]})
        }
        else if(loc === "bottom-right"){
          meaurements = measure_distance(display_x, display_y , d.left + d.width, d.top + d.height)
          top_right.push({distance: meaurements['distance'], position: "bottom-right", id: d.id, x1:meaurements["x1"], y1:meaurements["y1"], x2:meaurements["x2"], y2:meaurements["y2"]})
        }
        else if(loc === null){
          colllision_count++
          colliding_displays.push(d)
        }
      }

      if (colllision_count === 0){
      
      let dist = []
      if (top.length !== 0){
        top = top.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
        dist.push(top[0])
      }else{
        dist.push({distance:10000})
      }
      if (bottom.length !== 0){
        bottom = bottom.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
        dist.push(bottom[0])
      }else{
        dist.push({distance:10000})
      }
      if (left.length !== 0){
        left = left.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
        dist.push(left[0])
      }else{
        dist.push({distance:10000})
      }
      if (right.length !== 0){
        right = right.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
        dist.push(right[0])
      }else{
        dist.push({distance:10000})
      }

      dist = dist.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
      let min_val = dist[0]["distance"],
        loc = dist[0]["position"],
        item_id = dist[0]["id"];
      
        if (min_val !== 10000){
          if(loc === "top"){
            display.top = display.top + min_val
            display["grid_location"] = loc
          }
          else if(loc === "bottom"){
            display.top = display.top - min_val
            display["grid_location"] = loc
          }
          else if(loc === "left"){
            display.left = display.left + min_val
            display["grid_location"] = loc
          }
          else if(loc === "right"){
            display.left = display.left - min_val
            display["grid_location"] = loc
          }
        }
        else{
          if (top_left.length !== 0){
            top_left = top_left.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
            dist.push(top_left[0])
          }else{
            dist.push({distance:10000})
          }
          if (top_right.length !== 0){
            top_right = top_right.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
            dist.push(top_right[0])
          }else{
            dist.push({distance:10000})
          }
          if (bottom_left.length !== 0){
            bottom_left = bottom_left.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
            dist.push(bottom_left[0])
          }else{
            dist.push({distance:10000})
          }
          if (bottom_right.length !== 0){
            bottom_right = bottom_right.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
            dist.push(bottom_right[0])
          }else{
            dist.push({distance:10000})
          }
          dist = dist.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
          let loc = dist[0]["position"],
          item_id = dist[0]["id"];

          if (loc === "top-left"){
            display.left = display.left + (dist[0]["x2"] - dist[0]["x1"])
            display.top = display.top + (dist[0]["y2"] - dist[0]["y1"])
            display["grid_location"] = loc
          }
          else if (loc === "top-right"){
            display.left = display.left - (dist[0]["x1"] - dist[0]["x2"])
            display.top = display.top + (dist[0]["y2"] - dist[0]["y1"])
            display["grid_location"] = loc
          }
          else if (loc === "bottom-left"){
            display.left = display.left + (dist[0]["x2"] - dist[0]["x1"])
            display.top = display.top - (dist[0]["y1"] - dist[0]["y2"])
            display["grid_location"] = loc
          }
          else if (loc === "bottom-right"){
            display.left = display.left - (dist[0]["x1"] - dist[0]["x2"])
            display.top = display.top - (dist[0]["y1"] - dist[0]["y2"])
            display["grid_location"] = loc
          }
          return {nearest_id:item_id, display_updated:display, collision_count:colllision_count, collision_displays:null}
        }
      return {nearest_id:item_id, display_updated:display, collision_count:colllision_count, collision_displays:null}
    }else{
      return {nearest_id:null, display_updated:null, collision_count:colllision_count, collision_displays:colliding_displays}
    }

    }catch(err) {

    }
  }

  export const snap_displays = (displayList, movingItem, isCorner, isCollistion) => {
    try{
      let displaysCopy = [...displayList]
      let nonMovingDisplays = displaysCopy.filter(e => e.id !== movingItem.id)


      let cumulative_displays = []
      let cumulative_ids = []
      let nearest_display = null

      for(let i=0; nonMovingDisplays.length > i; i++){
        let d = nonMovingDisplays[i]
        nearest_display = find_nearst(movingItem, nonMovingDisplays)
        let collision_displays = nearest_display["collision_displays"]
        if (nonMovingDisplays.length === 1){
          console.log("only one external display")
          if (nearest_display["collision_count"] !== 0){
             let displays = collisionCheck(movingItem, nonMovingDisplays, collision_displays)
            const centerDisplay = setCenterAlign(displays)
            return centerDisplay
          }else{
          cumulative_displays.push(nearest_display["display_updated"], nonMovingDisplays[i])
           const centerDisplay = setCenterAlign(cumulative_displays)
           return centerDisplay
        }
        }if(nearest_display["collision_count"] > 1 ){

          let displays = collisionCheck(movingItem, nonMovingDisplays, collision_displays)
          const centerDisplay = setCenterAlign(displays)
          return centerDisplay
        }


        if (!(cumulative_ids.includes(d["id"])) && i === 0){
          nearest_display = find_nearst(movingItem, nonMovingDisplays) 
          if (nearest_display["collision_count"] !== 0){
            let collision_displays = nearest_display["collision_displays"]
            let displays = collisionCheck(movingItem, nonMovingDisplays, collision_displays)
            const centerDisplay = setCenterAlign(displays)
            return centerDisplay
             
          }else{
          cumulative_ids.push(nearest_display["nearest_id"])
          for(let i = 0; nonMovingDisplays.length > i; i++){
            if(nonMovingDisplays[i]["id"] === nearest_display["nearest_id"]){
              cumulative_displays.push(nearest_display["display_updated"], nonMovingDisplays[i])
              break
            }
          }
        }
      }

        if(!(cumulative_ids.includes(d["id"]))){
          nearest_display= find_nearst(d, cumulative_displays) 
          cumulative_ids.push(nearest_display["nearest_id"])    
          cumulative_displays.push(nearest_display["display_updated"])     
        }

        
      }
      
    const centerDisplay = setCenterAlign(cumulative_displays)
     return centerDisplay
      

    }catch(err) {
      console.log(err)
    }
  }