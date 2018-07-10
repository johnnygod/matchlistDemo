import { createSelector } from 'reselect'
import { viewMatch } from '../actions'
import Comp from '../components/matchList'
import { connect } from 'react-redux'

const getData = state => state == null ? null : state.data

const getMids = createSelector(
    [getData],
    (data) =>{
        return data == null ? null : data.msm
    }
)

const mapS2P = state => {
    return {
        mids: getMids(state)
    }
}


export default connect(mapS2P)(Comp)

