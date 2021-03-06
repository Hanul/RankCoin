RUN(() => {
	
	H1({
		style : {
			fontSize : 30,
			fontWeight : 'bold',
			padding : 10
		},
		c : UUI.BUTTON_H({
			icon : IMG({
				style : {
					height : 40,
					marginBottom : -8
				},
				src : 'resource/icon.png'
			}),
			spacing : 10,
			title : 'RankCoin'
		})
	}).appendTo(BODY);
	
	P({
		style : {
			padding : 10
		},
		c : ['RankCoin은 보유량으로 랭킹을 매겨주는 ERC-20 코인입니다.', BR(), A({
			target : '_blank',
			href : 'https://etherscan.io/token/' + RankCoinContract.getAddress(),
			c : '토큰 계약 주소: ' + RankCoinContract.getAddress()
		}), BR(), A({
			style : {
				color : '#3366CC',
				fontWeight : 'bold'
			},
			target : '_blank',
			href : 'https://github.com/Hanul/RankCoin',
			c : '소스코드'
		}), BR(), A({
			style : {
				color : '#3366CC',
				fontWeight : 'bold'
			},
			target : '_blank',
			href : 'https://medium.com/@youngjaesim/erc-20-%ED%86%A0%ED%81%B0%EC%9D%84-%EB%82%B4-%EC%A7%80%EA%B0%91%EC%97%90-%EB%93%B1%EB%A1%9D%ED%95%98%EA%B8%B0-metamask-e2746ea9c145',
			c : 'RankCoin을 내 지갑에 등록하는 방법'
		})]
	}).appendTo(BODY);
	
	let myCoinPanel;
	let myNamePanel;
	let myMessagePanel;
	
	let myWalletInfo = DIV().appendTo(BODY);
	
	WalletManager.getWalletAddress((walletAddress) => {
		
		myWalletInfo.append(P({
			style : {
				padding : 10
			},
			c : [
			'내 지갑 주소: ' + (walletAddress === undefined ? 'MetaMask에 로그인해주세요.' : walletAddress),
			myCoinPanel = DIV(),
			myNamePanel = DIV(),
			myMessagePanel = DIV(),
			P({
				c : '이름이나 메시지를 지정하면 랭킹에도 뜨게 됩니다.'
			}),
			A({
				style : {
					color : '#3366CC',
					fontWeight : 'bold'
				},
				c : '코인 전송',
				on : {
					tap : () => {
						let to = prompt('받을 사람의 지갑 주소');
						if (to !== TO_DELETE) {
							let amount = prompt('몇 코인을 전송하시겠습니까?');
							if (amount !== TO_DELETE) {
								amount *= Math.pow(10, 18);
								RankCoinContract.transfer({
									to : to,
									amount : amount
								});
							}
						}
					}
				}
			})]
		}));
	});
	
	RankCoinContract.on('ChangeName', (params) => {
		console.log('ChangeName', params);
	});
	
	RankCoinContract.on('ChangeMessage', (params) => {
		console.log('ChangeMessage', params);
	});
	
	RankCoinContract.on('Transfer', (params) => {
		console.log('Transfer', params);
	});
	
	RankCoinContract.on('Approval', (params) => {
		console.log('Approval', params);
	});
	
	WalletManager.checkIsLocked((isLocked) => {
		
		if (isLocked === true) {
			
			UUI.ALERT({
				style : {
					backgroundColor : '#fff',
					color : '#000',
					padding : 10,
					border : '1px solid #ccc'
				},
				buttonStyle : {
					marginTop : 10,
					padding : 10,
					border : '1px solid #ccc',
					borderRadius : 5
				},
				msg : [IMG({
					src : 'resource/metamask.png'
				}), P({
					c : 'MetaMask가 잠겨있습니다.\nMetaMask에 로그인해주시기 바랍니다.'
				})]
			});
		}
		
		else {
			
			WalletManager.getWalletAddress((walletAddress) => {
				
				NEXT([
				(next) => {
					RankCoinContract.balanceOf(walletAddress, (balance, balanceStr) => {
						
						if (balanceStr.length > 18) {
							let index = balanceStr.length - 18;
							balanceStr = balanceStr.substring(0, index) + '.' + balanceStr.substring(index);
						} else {
							let appendix = '0.';
							REPEAT(18 - balanceStr.length, () => {
								appendix += '0';
							});
							balanceStr = appendix + balanceStr;
						}
						
						let str = balanceStr.split('.');
						if (str[0].length >= 5) {
							str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
						}
						if (str[1] && str[1].length >= 5) {
							str[1] = str[1].replace(/(\d{3})/g, '$1 ');
						}
						
						myCoinPanel.append(DIV({
							c : ['내 보유 코인: ', str[0], '.', SPAN({
								style : {
									fontSize : '0.5em'
								},
								c : str[1]
							})]
						}));
						next();
					});
				},
				
				(next) => {
					return () => {
						
						RankCoinContract.names(walletAddress, (name) => {
							if (name === '') {
								myNamePanel.append(SPAN({
									c : '이름이 지정되어 있지 않습니다.'
								}));
							} else {
								myNamePanel.append(SPAN({
									c : '내 이름: ' + name
								}));
							}
							myNamePanel.append(A({
								style : {
									marginLeft : 5,
									color : '#3366CC',
									fontWeight : 'bold'
								},
								c : '이름 변경',
								on : {
									tap : () => {
										let name = prompt('이름을 입력해주세요.');
										if (name !== TO_DELETE) {
											RankCoinContract.setName(name);
										}
									}
								}
							}));
							
							next();
						});
					};
				},
				
				() => {
					return () => {
						
						RankCoinContract.messages(walletAddress, (message) => {
							if (message === '') {
								myMessagePanel.append(SPAN({
									c : '메시지가 지정되어 있지 않습니다.'
								}));
							} else {
								myMessagePanel.append(SPAN({
									c : '내 메시지: ' + message
								}));
							}
							myMessagePanel.append(A({
								style : {
									marginLeft : 5,
									color : '#3366CC',
									fontWeight : 'bold'
								},
								c : '메시지 변경',
								on : {
									tap : () => {
										let message = prompt('메시지를 입력해주세요.');
										if (message !== TO_DELETE) {
											RankCoinContract.setMessage(message);
										}
									}
								}
							}));
						});
					};
				}]);
			});
		}
	});
	
	let loadingRankPanel;
	let rankList = UUI.PANEL({
		style : {
			onDisplayResize : (width, height) => {
				if (width < 1024) {
					return {
						width : '100%',
						flt : 'none'
					};
				} else {
					return {
						width : '50%',
						flt : 'left'
					};
				}
			}
		},
		contentStyle : {
			padding : 10
		},
		c : [H2({
			style : {
				fontSize : 20,
				fontWeight : 'bold',
				marginBottom : 10
			},
			c : '랭킹'
		}), loadingRankPanel = P({
			c : '랭킹을 불러오는 중입니다.'
		})]
	}).appendTo(BODY);
	
	RankCoinContract.getUsersByBalance((users) => {
		
		loadingRankPanel.remove();
		
		EACH(users, (user, rank) => {
		
			RankCoinContract.getRank(user, console.log);
			
			let fontSize = 25 - rank / 2;
			if (fontSize < 5) {
				fontSize = 5;
			}
			
			let nameWrapper;
			let item = DIV({
				style : {
					marginBottom : 30,
					fontSize : fontSize
				},
				c : ['#' + (rank + 1), nameWrapper = A({
					style : {
						marginLeft : 10
					},
					c : user,
					target : 'blank',
					href : 'http://etherscan.io/address/' + user
				})]
			}).appendTo(rankList);
			
			NEXT([
			(next) => {
				RankCoinContract.balanceOf(user, (balance, balanceStr) => {
					
					if (balanceStr.length > 18) {
						let index = balanceStr.length - 18;
						balanceStr = balanceStr.substring(0, index) + '.' + balanceStr.substring(index);
					} else {
						let appendix = '0.';
						REPEAT(18 - balanceStr.length, () => {
							appendix += '0';
						});
						balanceStr = appendix + balanceStr;
					}
					
					let str = balanceStr.split('.');
					if (str[0].length >= 5) {
						str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
					}
					if (str[1] && str[1].length >= 5) {
						str[1] = str[1].replace(/(\d{3})/g, '$1 ');
					}
					
					item.append(DIV({
						c : ['보유 코인: ', str[0], '.', SPAN({
							style : {
								fontSize : fontSize * 0.5
							},
							c : str[1]
						})]
					}));
					next();
				});
			},
			
			(next) => {
				return () => {
					
					RankCoinContract.names(user, (name) => {
						if (name !== '') {
							nameWrapper.empty();
							nameWrapper.append(SPAN({
								c : name
							}));
							nameWrapper.append(SPAN({
								style : {
									marginLeft : 5,
									fontSize : fontSize * 0.8
								},
								c : '(' + user + ')'
							}));
						}
						next();
					});
				};
			},
			
			() => {
				return () => {
					
					RankCoinContract.messages(user, (message) => {
						if (message !== '') {
							item.append(DIV({
								c : '메시지: ' + message
							}));
						}
					});
				};
			}]);
		});
	});
	
	let bannerList = UUI.PANEL({
		style : {
			onDisplayResize : (width, height) => {
				if (width < 1024) {
					return {
						width : '100%',
						flt : 'none'
					};
				} else {
					return {
						width : '50%',
						flt : 'left'
					};
				}
			}
		},
		contentStyle : {
			padding : 10
		},
		c : [H2({
			style : {
				fontSize : 20,
				fontWeight : 'bold',
				marginBottom : 10
			},
			c : '배너'
		}), DIV({
			c : A({
				c : IMG({
					src : 'resource/banner/tokenroll.png'
				}),
				target : '_blank',
				href : 'https://tokenroll.net/'
			})
		}), P({
			style : {
				marginTop : 10
			},
			c : ['RankCoin을 사용하는 서비스나 게임의 배너 광고를 꽁짜로 달아드립니다.\n문의 : ', A({
				style : {
					color : '#3366CC'
				},
				src : 'mailto:hanul@hanul.me',
				c : 'hanul@hanul.me'
			})]
		})]
	}).appendTo(BODY);
	
	CLEAR_BOTH().appendTo(BODY);
});
