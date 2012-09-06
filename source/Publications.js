/* This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/.

 * Authors: 
 *	Rylan Cottrell,
 *	Hamidreza Baghi
*/


enyo.kind({
    name: "ca.ucalgary.cpsc.lsmr.Publications",
    kind: enyo.Control,
    tag: 'div',
	classes: "article",
	published:
	{
		bibtexfile:"assets/test.bib",
		bibData: undefined,
	},
	components:[
		{kind: "Repeater", onSetupItem:"setupItem", components: [
			{tag:"div", name:"publication", classes:"publication", allowHtml:true, components: [
				{tag:"div", name:"divider", classes:"divider"},
				{tag:"span", name: "authors", classes:"pub-authors", allowHtml:true}, 
				{tag:"a", name: "title", classes:"pub-title", allowHtml:true},
				{tag:"span", name: "proceedings", classes:"pub-proceedings", allowHtml:true},
				{tag:"span", name: "proceedingsExtra", classes:"pub-proceedings-extra", allowHtml:true},
				{tag:"span", name: "year", classes:"pub-year", allowHtml:true},
				{name: "doi", tag:"a", classes:"pub-doi", content:"DOI"},
				{tag:"span", name:"toAppear", showing:false, content:"TO APPEAR."}
			]}
		]}
	],
	create : function()
	{
		var	that = this,
			pubData = [];

		this.inherited(arguments);
		this.bibtexfileChanged();
		
	},
	bibtexfileChanged: function(){
		if ( this.bibtexfile )
		{
			var request = new enyo.Ajax({
				url: this.bibtexfile,
				handleAs: "text"
			});

			request.response(enyo.bind(this, "processBibDataFile"));
			request.go();
			
		}
	},
	processBibDataFile: function (inRequest, inResponse) {
		var bib;
		if(inResponse){
			bib = new BibTex();
			bib.content = inResponse;
			if ( bib.parse() ) {
				this.pubData = bib.data;	
				
				this.pubData.sort(function(a,b){
					return  b.year - a.year;
				});
				
				this.$.repeater.setCount(this.pubData.length);
			}
		}
	},
	setupItem:function(inSender, inEvent)
	{
		var i, 
			index = inEvent.index,
			publication = inEvent.item;
			publication.$.authors.setContent( this.formatAuthors(this.pubData[index]) );
			publication.$.title.setContent(this.pubData[index].title.replace("{", "").replace("}","") +". ");
			publication.$.proceedings.setContent(this.formatProceedings(this.pubData[index]));
			publication.$.proceedingsExtra.setContent(this.formatProceedingsExtra(this.pubData[index]))
			publication.$.year.setContent(this.pubData[index].year +". ");
			
			if(this.pubData[index].toappear){
				publication.$.toAppear.show();
			}

			if(this.pubData[index].doi){
				publication.$.doi.setAttribute("href", this.pubData[index].doi); 
			} else {
				publication.$.doi.hide();
			}

			if(this.pubData[index].pdf){
				publication.$.title.setAttribute("href", this.pubData[index].pdf); 
			} 

			if(this.pubData[index-1]){
				if(this.pubData[index-1].year - this.pubData[index].year) {
					publication.$.divider.setContent(this.pubData[index].year);
				} else {
					publication.$.divider.hide();
				}
			}else {
				publication.$.divider.setContent(this.pubData[index].year);
			}



	},
	formatAuthors: function(data) {
		var authors="";
			for ( i = 0 ; i < data.author.length ; ++i)
			{
				if ( i != 0 ) authors += ', ';
				authors += this.sepecialCharReplace(data.author[i].first) + " " + this.sepecialCharReplace(data.author[i].last);
			}
			authors +=".";
			return authors;
	},
	formatProceedings: function(data) {
		var pub = "";
		if ( data.entryType === 'article' )
		{
			pub += data.journal;
		}
		else if ( data.entryType === 'inproceedings')
		{
			pub += data.booktitle
		}
		if(pub) {
			pub +=", ";
		}
		return pub;
	},
	formatProceedingsExtra: function(data) {
		var extra = "";
		if ( data.entryType === 'article' )
		{
			
			extra += data.volume;
			if(data.number) {
				extra +="("+data.number+")";
			}
			extra += ":"+ data.pages.replace("--","&ndash;");
			extra +=", ";
			if(data.location){
				extra+= data.location +", ";
			}
		} else {
			if(data.entryType ==='phdthesis'){
				extra += "PhD. Thesis, ";
			}else if(data.entryType ==='masterthesis'){
				extra += "MSc. Thesis, ";
			}else if(data.entryType ==='techreport'){
				extra +="Technical Report "+data.number+", "
			}

			if(data.institution){
				extra+= data.institution +", ";
			}

			if(data.location){
				extra+= data.location +", ";
			}
			if(data.pages){
				extra +="pages " + data.pages.replace("--","&ndash;");
				extra +=", ";
			}
		}
		return extra;
	},
	sepecialCharReplace: function(inString){
		var s = inString.replace('{\\"o}', "&ouml").replace('\\"{o}', "&ouml").replace('\\"o', "&ouml");
		return s;
	}
});
