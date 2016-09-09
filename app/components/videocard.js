import React, { Component } from 'react'
import { Link } from 'react-router'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as videosActions from '../videos/actions'
import Truncate from 'react-truncate'

class VideoCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      poster: 'public/img/no-preview.jpg',
      peers: 0
    }
  }

  componentDidMount () {
    let torrent = this.props.webtorrent.client.get(this.props.video.video_id)
    if (!torrent) {
      this.props.webtorrent.client.add(this.props.video.magnet, (torrent) => {
        this.setState({peers: torrent.numPeers})
        torrent.on('wire', () => {
          this.setState({peers: torrent.numPeers})
        })
        // let file = torrent.files[0]
        // Stop downloading the file but still give information on peers
        // file.deselect()
        console.log(torrent.path)
        torrent.on('done', () => {
          console.log('Done !')
          // this.createPosterVideo('#' + torrent.infoHash + ' > video')
        })
        // torrent.files[0].appendTo('#' + torrent.infoHash)
      })
    } else {
      this.setState({peers: torrent.numPeers})
      torrent.on('wire', () => {
        this.setState({peers: torrent.numPeers})
      })
    }
  }

  createPosterVideo (video, format) {
    if (typeof video === 'string') {
      video = document.querySelector(video)
    }

    video.volume = 0

    if (video == null || video.nodeName !== 'VIDEO') {
      throw new Error('First argument must be a <video> element or selector')
    }

    if (format == null) {
      format = 'png'
    }

    if (format !== 'png' && format !== 'jpg' && format !== 'webp') {
      throw new Error('Second argument must be one of "png", "jpg", or "webp"')
    }

    let canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    canvas.getContext('2d').drawImage(video, 0, 0)

    let dataUri = canvas.toDataURL('image/' + format)
    let data = dataUri.split(',')[1]

    // unload video element
    video.pause()
    video.src = ''
    video.load()

    this.setState({poster: 'data:image/png;base64,' + data})
  }

  render () {
    let style = {
      maxWidth: '20rem'
    }

    let header = {
      wordWrap: 'break-word',
      height: '66px'
    }
    let description = {
      wordWrap: 'break-word',
      height: '120px'
    }
    return (
      <div style={style} className="card">
        <img className="card-img-top img-fluid" src={this.state.poster} alt="Card image cap" />
        <div className="card-block">
          <h5 style={header} className="card-title">
            <Truncate lines={3} ellipsis={<span>...</span>} >
              {this.props.video.title}
            </Truncate>
          </h5>
          <small className="text-muted">
            Added {moment(this.props.video.date_added).fromNow()} by <Link to={'/profile/' + this.props.video.user_name}>{this.props.video.user_name}</Link>
          </small>
          <br />
          <br />
          <p style={description} className="card-text text-subtle">
            <Truncate lines={5} ellipsis={<span>...</span>} >
              {this.props.video.description}
            </Truncate>
          </p>
          {this.props.mine ? <Link to={'/edit/' + this.props.video.json_id + '/' + this.props.video.video_id} role="button" className="btn btn-outline-success" >Edit</Link> : null}
          <Link to={'/watch/' + this.props.video.json_id + '/' + this.props.video.video_id} role="button" className={'btn btn-outline-primary pull-right ' + (this.state.peers === 0 ? 'disabled' : null)}>Watch it ({this.state.peers} peers)</Link>
        </div>
      </div>
    )
  }
};

function mapStateToProps (state) {
  return {
    videos: state.videos
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(videosActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoCard)
