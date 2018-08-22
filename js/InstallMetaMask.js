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
	
	BODY.append(DIV({
		c : [DIV({
			style : {
				padding : 10
			},
			c : [IMG({
				src : 'resource/metamask.png'
			}), P({
				style : {
					marginTop : 10
				},
				c : 'DApp을 사용하기 위해서는 MetaMask가 필요합니다. MetaMask를 설치해주시기 바랍니다.'
			}), DIV({
				style : {
					marginTop : 10
				},
				c : A({
					style : {
						color : '#3366CC',
						fontWeight : 'bold'
					},
					target : '_blank',
					href : 'https://medium.com/@youngjaesim/metamask%EB%A1%9C-%EC%9D%B4%EB%8D%94%EB%A6%AC%EC%9B%80-%EC%A7%80%EA%B0%91-%EB%A7%8C%EB%93%A4%EA%B8%B0-84042d14f2f6',
					c : 'MetaMask로 이더리움 지갑 만드는 방법'
				})
			})]
		})]
	}));
});