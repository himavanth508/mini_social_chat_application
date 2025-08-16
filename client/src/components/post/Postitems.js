import React from 'react'
import Comment from '../comment/Comment'
export default function Postitems(props) {
    const elem = props.elem
  return (
    <div>
        <div>{elem.item}<br></br> <img src={elem.file}/></div>
        {/* <Comment id={item._id}/> */}
    </div>
  )
}
