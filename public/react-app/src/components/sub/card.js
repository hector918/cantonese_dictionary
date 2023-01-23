export default function Card({data}) {

  return (

    <div className="column is-one-third">
      <div className="card">
        <div className="card-content">
          <div className="title">{data.english}</div>
          <div className="subtitle">{data.chinese}
            <button className="button" chinese_word={data.chinese}>Audio</button>
          </div>
          <div className="title">{data.phonics}</div>
          <p>{data['chinese sentence example']}</p>
          <p>{data['english sentence example']}</p>
          <div className="tags">
            {Object.values(data.tags).map((el,idx)=><span key={idx} className="tag is-info is-light">{el}</span>)}
          </div>
        </div>
      </div>
    </div>

  )
}