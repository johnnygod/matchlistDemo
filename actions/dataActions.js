import {genActionCreactor} from './utils'
// import {updateChannel} from '../socketClient'

const genDataActions = (prefix, fetchDataAPI) => {
	const actionTypes = {
		FETCHDATA: prefix + '_FETCHDATA',
		RESET: prefix + '_RESET',
	}

	// const updateActions = updateChannel.reduce((acc, uc) => {
	// 	const ucType = uc.toUpperCase()
	// 	actionTypes[ucType] = `${prefix}_${ucType}`

	// 	acc[uc] = genActionCreactor(actionTypes[ucType], 'data')
	// 	return acc
	// }, {})

	const init = genActionCreactor(actionTypes.FETCHDATA, 'data')

	const undefinedAPI = fetchDataAPI === undefined
	let fetchData = undefined
	if(undefinedAPI)
		console.log('[dataActions] Please defined fetchDataAPI or fetchData won\'t work!')
	else
		fetchData = (...theArgs) => {
			return dispatch => {
				return fetchDataAPI.apply(this, theArgs)
						.then(({data}) => {							
							return dispatch(init(data))
							// return Promise.resolve(true)
						})
			}
		}
	
	const reset = genActionCreactor(actionTypes.RESET)

	return Object.assign({actionTypes, init, reset}, undefinedAPI ? {} : {fetchData})
}

export default genDataActions