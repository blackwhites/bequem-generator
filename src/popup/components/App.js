import React from 'react'
import {Tablist, Tab} from 'evergreen-ui'
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/dist/light'
import js from 'react-syntax-highlighter/dist/languages/javascript'
import syntaxStyle from './syntaxStyle'
import styles from './App.css'
/*
 * TODO Need to check why importing css doesn't work here.
 */
//import 'bootstrap/dist/css/bootstrap.min.css';
//import 'react-bootstrap-table-next/dist/react-bootstrap-table2.css';
import BootstrapTable from 'react-bootstrap-table-next';

registerLanguage('javascript', js)

const tabs = ['Generate Code', 'Generate Test Case']

const App = ({onSelectTab, selectedTab, onRestart, recording, components}) => {

    let contentByType = null;

    if (selectedTab === 'Generate Code') {

        const script = getScript(recording)

        contentByType = (
            <SyntaxHighlighter language='javascript' style={syntaxStyle} textAlign='center'>
                {script}
            </SyntaxHighlighter>
        )

    } else if (selectedTab === 'Generate Test Case') {

        const columns = [{
            dataField: 'id',
            text: 'ID'
        }, {
            dataField: 'name',
            text: 'Name'
        }, {
            dataField: 'value',
            text: 'Value'
        }, {
            dataField: 'selector',
            text: 'Selector'
        }, {
            dataField: 'tagName',
            text: 'TagName'
        }];

        contentByType =  (
            <div className={styles.tableWrapDiv}>
                <BootstrapTable keyField='id' data={components} columns={columns} trClassName={styles.tableDiv}/>
            </div>

        )

    }


    return (<div>

        <Tablist marginX={-4} marginBottom={16} textAlign='center' className={styles.tabClass}>
            {tabs.map((tab, index) => (
                <Tab
                    key={tab}
                    id={tab}
                    isSelected={tab === selectedTab}
                    onSelect={() => onSelectTab(tab)}
                    aria-controls={`panel-${tab}`}
                >
                    {tab}
                </Tab>
            ))}
        </Tablist>

        {contentByType}

        <div className={styles.buttonDiv}>
            <button className={styles.button} onClick={onRestart}>Restart</button>
        </div>

    </div>)

}

function getScript(recording) {
    return `const Chromy = require('chromy')
let chromy = new Chromy({visible:true})

chromy.chain()
${recording.reduce((records, record, i) => {
        const {action, url, selector, value} = record
        let result = records
        if (i !== records.length) result += '\n'

        switch (action) {
            case 'keydown':
                result += `.type('${selector}', '${value}')`
                break
            case 'click':
                result += `.click('${selector}')`
                break
            case 'goto':
                result += `.goto('${url}')`
                break
            case 'reload':
                result += `.refresh()`
                break
        }

        return result
    }, '')}
    .evaluate(() => {
        return document.querySelectorAll('*').length
    })
    .result((r) => console.log(r))
    .end()
    .then(() => chromy.close())`
}

export default App
