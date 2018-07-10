import { createSelector } from 'reselect'

const betTypes = [{name: 'ah', id: '1119'}, {name: 'ou', id: '1144'}]

const filterMksFN = (mid, displayBT, allMkIds, mks) => {
	let mksIds_l = [], mksIds_r = []

	allMkIds.some(mkId => {
		const mk = mks[prefix.mk + mkId]

		if(mk.betTypeId == displayBT[0] && mksIds_l.length < 3)
			mksIds_l.push(mkId)
		else if(mk.betTypeId == displayBT[1] && mksIds_r.length < 3)
			mksIds_r.push(mkId)

		return mksIds_l.length == 3 && mksIds_r.length == 3
	})

	let combinedMkIds = []
	if(mksIds_l.length >= mksIds_r.length)
		combinedMkIds = mksIds_l.map((item, idx) => {
			return [item, mksIds_r[idx]]
		})
	else
		combinedMkIds = mksIds_r.map((item, idx) => {
			return [mksIds_l[idx], item]
		})

	return combinedMkIds
}

const getData = (state) => {
    return state == null ? null : state.data
}
const getMatchId = (_, props) => props.id

const getMatch = createSelector(
    [getMatchId, getData],
    (mid, data) => {
        if(data == null || mid == null)
            return null

        const {ms} = data, mKey = prefix.m + mid

        if(ms == null)
            return null
        
        return ms[mKey]
    }
)

const getMarketIdsByMatch = createSelector(
    [getMatchId, getData],
    (mid, data) => {
        if(data == null || mid == null)
            return null

        const {mksBm} = data, mKey = prefix.m + mid

        if(mksBm == null)
            return null
        
        return mksBm[mKey]
    }
)

const getAllMarkets = createSelector(
    [getData],
    (data) => {
        return data == null ? null : data.mks
    }
)

const getLangs = createSelector(
    [getData],
    (data) => {
        return data == null ? null : data.langs
    }
)


const getMatchData = createSelector(
    [
        getMatch,
        getMarketIdsByMatch,
        getAllMarkets,
        getLangs,        
        getLocalization,      
        getMatchId,
    ],
    (m, _mkIds, mks, langs, l, id) => {    
        if(m == null)
            return noDataProps

        const isFav = false	

        const {inplay, inplayTime, neutral, eventDateTime: edt, leagueName, teams, period, redCards, isHServing, sportId: sid, scores} = m

        const teamNames = teams.map(item => langs[prefix.lang + item])

        const ln = langs[prefix.lang + leagueName]

        let displayBTIds = null
        if(betTypes != null){
            displayBTIds = betTypes.map(item => {
                return item == null ? null : item.id 
            })
        }

        let mkIds = [], topMkCount = 1
        if(_mkIds != null && mks != null){
            if(displayBTIds != null)
                mkIds = filterMksFN(id, displayBTIds, _mkIds, mks)
            else
                mkIds = _mkIds

            const marketByBetTypeCount = _mkIds.reduce((acc, cur) => {
                const {betTypeId} = mks[prefix.mk + cur], propKey = `bt_${betTypeId}`

                if(!acc.hasOwnProperty(propKey))
                    acc[propKey] = 1
                else
                    acc[propKey] += 1

                return acc
            }, {})

            topMkCount = Object.keys(marketByBetTypeCount).reduce((acc, cur) => {
                const tmpCount= marketByBetTypeCount[cur]
                return acc > tmpCount ? acc : tmpCount
            }, 0)

            if(topMkCount == 0)
                topMkCount = 1
            else
                topMkCount = Math.min(topMkCount, 3)
        }		

        return {
            id, inplay, inplayTime, neutral, edt, ln, isFav,
            isComboMode: false, l, mkIds, period, sid,
            scores, redCards, teamNames, isHServing, topMkCount
        }
    }
)