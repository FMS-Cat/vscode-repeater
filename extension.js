const vscode = require( 'vscode' );

// == Position / Range wrapper =================================================
const position = ( l, c ) => new vscode.Position( l, c );
const range = ( l1, c1, l2, c2 ) => new vscode.Range( position( l1, c1 ), position( l2, c2 ) );

exports.activate = ( context ) => {
  let repeat = vscode.commands.registerCommand( 'extension.repeat', () => {
    // == grab the current editor ==============================================
    let editor = vscode.window.activeTextEditor;
    if ( !editor ) {
      vscode.window.showErrorMessage( 'Repeater: There is no active text editor!' );
      return;
    }

    // == grab etcetcetc =======================================================
    let document = vscode.window.activeTextEditor.document;
    let selections = vscode.window.activeTextEditor.selections;

    // == process each selection ===============================================
    selections.map( ( selection ) => {
      if ( selection.start.line !== selection.end.line ) { // multiline will not be tolerated
        vscode.window.showWarningMessage( 'Repeater: Multiline is not supported' );
        return;
      }

      // == grab text and line =================================================
      let line = selection.start.line;
      let text = document.lineAt( line ).text;

      // == determine how many chars I need to insert ==========================
      let pos = text.length;
      pos += ( text.split( '\t' ).length - 1 ) * ( editor.options.tabSize - 1 );
      let desiredLen = vscode.workspace.getConfiguration( 'repeater' ).desiredLength;
      let len = desiredLen - pos;

      // == now choose my repeating text =======================================
      let selStart = selection.start.character;
      let selEnd = selection.end.character;
      if ( selStart === selEnd ) {
        if ( selEnd === 0 ) {
          vscode.window.showWarningMessage( 'Repeater: uh' );
          return;
        }
        selStart = selEnd - 1;
      }

      // == this is the string I'm gonna insert ================================
      let sel = text.substring( selStart, selEnd );
      let str = sel.repeat( len ).substring( 0, len );

      // == insert! ============================================================
      editor.edit( ( edit ) => {
        edit.insert( position( line, selEnd ), str );
      } );
    } );
  } );

  context.subscriptions.push( repeat );
}

exports.deactivate = () => {
};