import React, {Component, PureComponent} from 'react'
import PropTypes from 'prop-types'
import 'arrayEX'
import Animation from '../animate/animation'
import { TransitionGroup } from 'react-transition-group'
import {SlidePrevNext2x, animationType} from '../animate/slide-prev-next'
import Collapse from '../animate/collapse'
import css from '../../static/less/compo/match.less'
import {accumulateInplayTime} from '../utils'

class Header extends Component{
	constructor(props){
		super(props)

		this.toggleActionBar = this.toggleActionBar.bind(this)
		this.toggleFavAndActionBar = this.toggleFavAndActionBar.bind(this)

		const {inplay, sid, tick, inplayTime} = this.props

		const finalInplayTime = inplay && sid == 1 ? accumulateInplayTime(inplayTime, tick * 1000) : inplayTime

		this.state = {
			inplayTime: finalInplayTime
		}
	}

	toggleActionBar(){
		const {id, toggleActionBar, enableP2T, toggleFav} = this.props

		if(enableP2T)
			return toggleActionBar(id)
		else
			return toggleFav()
	}

	toggleFavAndActionBar(){
		const {id, toggleActionBar, toggleFav} = this.props
		toggleFav()
		toggleActionBar(id)
	}

	componentWillReceiveProps(nextProps){
		const {id, inplayTime: inplayTime_p, inplay, sid, tick: tick_p} = this.props
		const {inplayTime, tick} = nextProps

		if(sid == 1 && inplay){

			if(inplayTime_p != inplayTime){
				this.setState({
					inplayTime: accumulateInplayTime(inplayTime)
				})
			}

			if(tick > tick_p){
				this.setState({
					inplayTime: accumulateInplayTime(this.state.inplayTime)
				})
			}
		}
	}

	render(){
		const {inplay,  edt, neutral, isComboMode, ln, isFav, displayActionBar, enableP2T, sid, period,
			isP2T, l, toggleMoreMarket, canExpand, showMoreMarket, togglePin2Top} = this.props

		const {inplayTime} = this.state
		
		let timeByPeriod = edt
		if(sid == 1 && inplay){
			if((period == 3 ||  period == 5) || (period == 4 && !inplayTime)) timeByPeriod = l['period_' + period]
			else timeByPeriod = inplayTime	
		}

		return (
			<div className={css.match__header + ' ' + (inplay ? css.match__header_inplay : css.match__header_early)}>
				<div className={css.match__favPin} onClick={this.toggleActionBar}>
	        		{		            	
            			enableP2T ? (
		            		<svg className={css.match__iconFavPin}>
				                <use xlinkHref={`#${isP2T ? (isFav ? 'icon-btn_favorite_on_pinned' : 'icon-btn_favorite_pinned' ) : (isFav ? 'icon-btn_favorite_on' : 'icon-btn_favorite')}`}></use>
				            </svg>
	            		) : (
	            			<svg className={css.match__iconFav}>
				                <use xlinkHref={`#${isFav ? 'icon-btn_favorite_active': (inplay ? 'icon-btn_favorite_inplay_inactive': 'icon-btn_favorite_early_inactive')}`}></use>
				            </svg>
	            		)
	            	}
	        	</div>

				<div className={css.match__info}>
					<div className={css.match__time +' '+ (inplay ? css.match__time_inplay : css.match__time_early)}>
						{timeByPeriod} 
					</div>
                    {
                        neutral ? (
                        	<div className={css.match__neutral}>
								<svg className={css.match__iconNeutral}>
									<use xlinkHref={`#icon-ico_neutral${inplay ? '_dark' : '_light'}`}></use>
								</svg>
							</div>

                            ) : null
                    }
					<div className={css.match__ln + ' ' + (inplay ? css.match__ln_inplay : css.match__ln_early)}>{ln}</div>
                    {
                        isComboMode ? (
								<svg className={css.match__iconCombo}>
									<use xlinkHref="#icon-ico_combo"></use>
								</svg>
                            ) : null
                    }

				</div>

		        <div className={css.match__moreMK} onClick={toggleMoreMarket} >
					<svg className={css.match__iconMoreMK}>
						<use xlinkHref={`#icon-btn_more_odds_${canExpand ? (showMoreMarket ? 'hide' : 'show') : 'disable'}`}></use>
					</svg>
				</div>

				<Animation act='leftIn' in={displayActionBar}>
					<div className={css.match__actionBar + ' ' + (inplay ? css.match__actionBar_inplay : css.match__actionBar_early)}>
						<div className={css.match__actionClose} onClick={this.toggleActionBar}>
	            	    	<svg className={css.match__iconActionClose}>
				                <use xlinkHref="#icon-btn_close_favorite"></use>
				            </svg>
				        </div>

				        <div className={css.match__actionFavPin}>
						        <div className={css.match__actionFav} onClick={this.toggleFavAndActionBar}>
						            <svg className={css.match__iconActionFav}>
						            	{
											isFav ? <use xlinkHref="#icon-btn_favorite_active"></use> : inplay ?  <use xlinkHref="#icon-btn_favorite_inplay_inactive"></use> : <use xlinkHref="#icon-btn_favorite_early_inactive"></use>
										}
					            	</svg>
						            <div className={css.match__textActionBar + ' ' + (inplay ? css.match__textActionBar_inplay : css.match__textActionBar_early)}>{isFav ? l.remove_favorite : l.add_favorite}</div>
						        </div>
						        <div className={css.match__actionPin} onClick={togglePin2Top}>
						            <svg className={css.match__iconActionPin}>
						            	{
											isP2T ? <use xlinkHref="#icon-btn_pin_active"></use> : inplay ? <use xlinkHref="#icon-btn_pin_inplay_inactive"></use> : <use xlinkHref="#icon-btn_pin_early_inactive"></use>
										}

					            	</svg>
						            <div className={css.match__textActionBar + ' ' + (inplay ? css.match__textActionBar_inplay : css.match__textActionBar_early)}>{isP2T? l.unpin : l.pin_to_top}</div>
						        </div>
						    </div>
					</div>
						
				</Animation>
		    </div>
		)
	}
}


Header.propTypes = {
	id: PropTypes.string.isRequired,
	inplay: PropTypes.bool.isRequired,
	inplayTime: PropTypes.string,
	edt: PropTypes.string,
	neutral: PropTypes.bool.isRequired,
	isComboMode: PropTypes.bool.isRequired,
	ln: PropTypes.string.isRequired,
	isFav: PropTypes.bool.isRequired,
	toggleFav: PropTypes.func.isRequired,
	displayActionBar: PropTypes.bool.isRequired,
	toggleActionBar: PropTypes.func.isRequired,
	isP2T: PropTypes.bool.isRequired,
	togglePin2Top: PropTypes.func.isRequired,
	toggleMoreMarket: PropTypes.func.isRequired,
	l: PropTypes.object.isRequired,
	enableP2T: PropTypes.bool.isRequired,
}

const SportHasHServing = [4, 5, 9, 10, 11]
class MatchInfoRow extends PureComponent{
	render(){
		const {inplay, sid, tn, redCard, score, serving, isFirstRow, width} = this.props

		let hasHServing, scoreInfo
		if(inplay){
			hasHServing = SportHasHServing.includesEX(sid)

			if(score == null)
				scoreInfo = null
			else if(Array.isArray(score))
				scoreInfo = score.map((s, idx) => {
					return <div key={`score_${idx}`} className={css.matchInfo__arrScore + ' ' + (idx == 0 ? css.matchInfo__arrScore_fisrt :  css.matchInfo__arrScore_others) + ' ' + (idx == score.length - 1 ? css.matchInfo__arrScore_last : '')}>{s}</div>
				})
			else
				scoreInfo = <div className={css.matchInfo__score}>{score}</div>
		}
		const matchInfoWidth = inplay && hasHServing ? {width: width - 227} : {width: width - 175}

		return (
			<div className={css.matchInfo__matchScore + ' ' + (isFirstRow ? css.matchInfo__matchScore_firstRow : css.matchInfo__matchScore_othersRow)}>
                {
                	inplay && hasHServing ? (
                		<div className={css.matchInfo__serving} style={matchInfoWidth}>
						    <div className={css.matchInfo__servingArea}>
						        {isFirstRow && serving ? <div className={css.matchInfo__servingBall}></div> : null}
						    </div>
							<div className={css.matchInfo__tnameArea}>
								<div className={css.matchInfo__tnameText}>{tn}</div>
								<div className={css.matchInfo__tnameFadeOut}></div>
							</div>
						</div>
            		) : (
            			<div style={matchInfoWidth}>
							<div className={css.matchInfo__tnameArea}>
								<div className={css.matchInfo__tnameText}>{tn}</div>
								<div className={css.matchInfo__tnameFadeOut}></div>
							</div>
						</div>
            		)
                }
                {
                	inplay && isFirstRow ? (
                		<div className={css.matchInfo__inplayFirstRow}>
				            {redCard != null && redCard != 0 ? <div className={css.matchInfo__redCard + ' ' + css.redCard}>{redCard}</div> : null}
				            {scoreInfo}
				        </div>
            		) : null
                }
            </div>
		)
	}
}

MatchInfoRow.propTypes = {
	sid: PropTypes.string.isRequired,
	tn: PropTypes.string.isRequired,
	redCard: PropTypes.number,
	serving: PropTypes.bool,
	score: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.array
	]),
	// viewMatch: PropTypes.func.isRequired,
	isFirstRow: PropTypes.bool.isRequired,
	width: PropTypes.number
}

class Content extends Component{
	constructor(props){
		super(props)

		this.state = {
			animateType: null
		}

		this.handleGetAnimationType = this.handleGetAnimationType.bind(this)
	}

	componentWillReceiveProps(nextProps){
		const {mkIds} = nextProps
		const {mkIds: mkIds_p, betTypeMenuIdx} = this.props
		const {animateType} = this.state

		let changeMk
		if(mkIds != null && mkIds_p != null)
			changeMk = mkIds.some((mkId, idx) => mkId != mkIds_p[idx])
		else if(mkIds == null)
			changeMk = mkIds_p != null
		else if(mkIds_p == null)
			changeMk = mkIds != null

		if(changeMk)
			this.setState({
				animateType: animateType == null ? (betTypeMenuIdx == 0 ? animationType.next : animationType.prev) : (animateType == animationType.next ? animationType.prev : animationType.next)
			})
	}

	handleGetAnimationType(){
		return this.state.animateType
	}

	render(){
		const {inplay, sid, id, teamNames, redCards, scores, mkIds, SelectionComp, isHServing, viewMatch, isFirstRow, width} = this.props

		return (
			<div className={css.matchContent + ' ' + (isFirstRow ? css.matchContent__firstMK : css.matchContent__othersMK)} onClick={viewMatch}>
				{
					teamNames.map((tn, idx) => {
						let minfoProps = {
							inplay, sid, tn, isFirstRow, width
						}

						if(inplay)
							minfoProps = Object.assign({}, minfoProps, {
								redCard: redCards == null ? null : redCards[idx],
								score: scores == null ? null : scores[idx],
								serving: idx == 0 ? isHServing : !isHServing,
                                width
							})

						const mkId_l = mkIds == null ? null : mkIds[0], mkId_r = mkIds == null ? null : mkIds[1]

						return (
							<div key={`minfo_row${idx}`} className={css.matchContent__row + ' ' + (idx == teamNames.length - 1 ?  '' : css.matchContent__row_notLast)}>
					            <MatchInfoRow {...minfoProps} />
					            <div className={css.selsContent}>
					            	<TransitionGroup className={css.selsContent__transition}>
					            		<SlidePrevNext2x key={`m_${id}_l_mk_${mkId_l}_row${idx}`} getAnimationType={this.handleGetAnimationType} >
							            	<div className={css.selsContent__slideTransition}>
							                	<SelectionComp mid={id} mkid={mkId_l} idx={idx} />
							                </div>
						                </SlidePrevNext2x>
						                <SlidePrevNext2x key={`m_${id}_r_mk_${mkId_r}_row${idx}`} getAnimationType={this.handleGetAnimationType} >
							                <div className={css.selsContent__slideTransition}>
							                	<SelectionComp mid={id} mkid={mkId_r} idx={idx}/>
							                </div>
						                </SlidePrevNext2x>
					                </TransitionGroup>
					            </div>
					        </div>
						)
					})
				}
		    </div>
		)
	}
}

Content.propTypes = {
	sid: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	teamNames: PropTypes.array.isRequired,
	redCards: PropTypes.array,
	scores: PropTypes.array,
	mkIds: PropTypes.array,
	SelectionComp: PropTypes.func.isRequired,
	isHServing: PropTypes.bool,
	viewMatch: PropTypes.func.isRequired,
	isFirstRow: PropTypes.bool.isRequired,
	betTypeMenuIdx: PropTypes.number.isRequired,
}


class Match extends Component{
	constructor(props){
		super(props)

		this.state = {
			showMoreMarket: false,
		}

		this.toggleMoreMarket = this.toggleMoreMarket.bind(this)
	}

	toggleMoreMarket(){
		this.setState({
			showMoreMarket: !this.state.showMoreMarket
		})
	}

	render(){
		const {id, inplay, neutral, edt, mkIds, SelectionComp, ln, isFav, toggleFav, enableP2T,
			isComboMode, togglePin2Top, isP2T, inplayTime, sid, period, scores, redCards, topMkCount,
			teamNames, isHServing, viewMatch, displayActionBar, toggleActionBar, l, width, tick, betTypeMenuIdx} = this.props

		const {showMoreMarket} = this.state
		const canExpand = topMkCount > 1

		const headerProps = {id, inplay, inplayTime, edt, neutral, isComboMode, ln, isFav, isP2T, togglePin2Top, enableP2T, sid, period,
								toggleFav, displayActionBar, toggleActionBar, toggleMoreMarket: this.toggleMoreMarket, showMoreMarket, canExpand, l, tick}

		const contentPropsBase = {inplay, sid, id, teamNames, redCards, scores, SelectionComp, isHServing, viewMatch, width, betTypeMenuIdx}

		const contentCount = topMkCount

		let defaultContent = []
		let showMoreContent = []
		for(let i = 0; i < contentCount; i++){
			const prop = Object.assign({}, contentPropsBase, {mkIds: mkIds[i]})
			if(i == 0){
    			defaultContent.push(<Content key={`mc_${id}_${i}`} {...prop} isFirstRow={i == 0} />) 
    			continue
			}
			showMoreContent.push(<Content key={`mc_${id}_${i}`} {...prop} isFirstRow={i == 0} />)
		}

		return (
	          <div className={css.match}>
	              <Header {...headerProps}/>

	              {defaultContent}
	              <Collapse in={showMoreMarket}>
	                <div>
	                  { showMoreContent }
	                </div>
	              </Collapse>
	          </div>
		)
		
	}
}

Match.propTypes = {
	id: PropTypes.string.isRequired,
	inplay: PropTypes.bool.isRequired,
	neutral: PropTypes.bool.isRequired,
	edt: PropTypes.string,
	mkIds: PropTypes.array.isRequired,
	SelectionComp: PropTypes.func.isRequired,
	ln: PropTypes.string.isRequired,
	isFav: PropTypes.bool.isRequired,
	toggleFav: PropTypes.func.isRequired,
	enableP2T: PropTypes.bool.isRequired,	 
	isComboMode: PropTypes.bool.isRequired,
	togglePin2Top: PropTypes.func.isRequired,
	isP2T: PropTypes.bool.isRequired,
	inplayTime: PropTypes.string,
	sid: PropTypes.string.isRequired,
	scores: PropTypes.array,
	redCards: PropTypes.array,
	topMkCount: PropTypes.number.isRequired,
	teamNames: PropTypes.array.isRequired,
	isHServing: PropTypes.bool,
	viewMatch: PropTypes.func.isRequired,
	displayActionBar: PropTypes.bool.isRequired,
	toggleActionBar: PropTypes.func.isRequired,
	l: PropTypes.object.isRequired,
}

export default Match