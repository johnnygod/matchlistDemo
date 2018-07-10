import {getInplayData} from '../api'
import genDataActions from '../actions/dataActions'

const typePrefix = 'IP'

const {actionTypes: baseTypes, init, fetchData, add: addBase, update, del, reset} = genDataActions(typePrefix, getInplayData)

//base data action
export {init, fetchData, update, reset, del}

//MatchList action
export {togglePin2Top, updateFilterLeague}

export const actionTypes = Object.assign(baseTypes, types_matchList, {
	//other types
})

