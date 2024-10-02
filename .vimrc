call plug#begin()

Plug 'sirver/ultisnips'
    let g:UltiSnipsExpandTrigger = '<tab>'
    let g:UltiSnipsJumpForwardTrigger = '<tab>'
    let g:UltiSnipsJumpBackwardTrigger = '<s-tab>'

Plug 'lervag/vimtex'
    let g:tex_flavor='latex'
    let g:vimtex_view_method='zathura'
    let g:vimtex_quickfix_mode=0

Plug 'KeitaNakamura/tex-conceal.vim'
    set conceallevel=1
    let g:tex_conceal='abdmg'
    hi Conceal ctermbg=none

Plug 'tpope/vim-surround'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'elkowar/yuck.vim'
Plug 'rstacruz/sparkup'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'prettier/vim-prettier', {
  \ 'do': 'yarn install',
  \ 'for': [
    \ 'javascript',
    \ 'typescript',
    \ 'css',
    \ 'less',
    \ 'scss',
    \ 'json',
    \ 'graphql',
    \ 'markdown',
    \ 'vue',
    \ 'lua',
    \ 'php',
    \ 'python',
    \ 'ruby',
    \ 'html',
    \ 'swift' ] }
Plug 'preservim/nerdtree'
Plug 'dyng/ctrlsf.vim'
Plug 'mg979/vim-visual-multi', {'branch': 'master'}
Plug 'digitaltoad/vim-pug'

call plug#end()

let g:airline_powerline_fonts = 1
let g:airline_theme='bubblegum'
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#left_sep = ''
let g:netrw_liststyle = 3
let g:netrw_banner = 0
let g:netrw_browse_split = 0

let g:prettier#autoformat = 1
let g:prettier#autoformat_require_pragma = 0

let g:ctrlsf_default_root = 'project'

let NERDTreeIgnore=['node_modules']

augroup markdownSpell
    autocmd!
    autocmd FileType text setlocal spell
    autocmd FileType text set spelllang=en_gb
    autocmd FileType tex setlocal spell
    autocmd FileType tex set spelllang=en_gb
augroup END
set tabstop=4 shiftwidth=4 expandtab
cabbrev tabv tab sview +setlocal\ nomodifiable
set number
set relativenumber
set ai
syntax enable
if has('termguicolors')
    set termguicolors
endif
let g:sonokai_style = 'andromeda'
let g:sonokai_enable_italic = 1
let g:sonokai_disable_italic_comment = 0
let g:sonokai_transparent_background = 1
colorscheme sonokai
let &t_ut=''
hi Normal guibg=NONE ctermbg=NONE
filetype plugin on

let g:ctrlsf_default_root = 'project'

inoremap <C-l> <c-g>u<Esc>[s1z=`]a<c-g>u
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
inoremap " ""<left>
inoremap ' ''<left>
inoremap ( ()<left>
inoremap [ []<left>
inoremap { {}<left>
inoremap {<CR> {<CR>}<ESC>O
inoremap {;<CR> {<CR>};<ESC>O
nnoremap <C-Left> :tabprevious<CR>
nnoremap <C-Right> :tabnext<CR>
nnoremap <silent> <A-Left> :tabm -1<CR>
nnoremap <silent> <A-Right> :tabm +1<CR>
nnoremap bn :bn<CR>
nnoremap bp :bp<CR>
nnoremap bd :buffers<CR>:bd<Space>
nnoremap bs :b#<CR>
nnoremap bq :bp <BAR> :bd #<CR>
nnoremap bl :ls<CR>
nnoremap bo :buffers<CR>:buffer<Space>
function! RepeatChar(char, count)
  return repeat(a:char, a:count)
endfunction
nnoremap s :<C-U>exec "normal i".RepeatChar(nr2char(getchar()), v:count1)<CR>
nnoremap S :<C-U>exec "normal a".RepeatChar(nr2char(getchar()), v:count1)<CR>
nnoremap j g<down>
nnoremap k g<up>
nnoremap <F5> gd[{V%::s// "Rename variable inside function
nnoremap gr gd[{V%::s/<C-R>///gc<left><left><left>
nnoremap gR gD:%s/<C-R>///gc<left><left><left>
nnoremap :W :w
nnoremap :Q :q
inoremap <silent> <C-_> <ESC>:silent! normal! mz<Right><Right>b~`z<CR>a
nnoremap <silent> <C-_> :silent! normal! mz<Right>b~`z<CR>
nnoremap <A-j> :m .+1<CR>==
nnoremap <A-k> :m .-2<CR>==
inoremap <A-j> <Esc>:m .+1<CR>==gi
inoremap <A-k> <Esc>:m .-2<CR>==gi
vnoremap <A-j> :m '>+1<CR>gv=gv
vnoremap <A-k> :m '<-2<CR>gv=gv

nnoremap <leader>n :NERDTreeFocus<CR>
nnoremap - :NERDTreeToggle<CR>
nnoremap <C--> :NERDTreeFind<CR>
" Start NERDTree when Vim is started without file arguments.
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists('s:std_in') | NERDTree | endif

nnoremap <C-f> <Plug>CtrlSFPrompt
vnoremap <C-f> <Plug>CtrlSFVwordExec

call vimtex#imaps#add_map({
  \ 'lhs' : '<S-CR>',
  \ 'rhs' : '',
  \ 'leader' : '',
  \ 'wrapper' : 'vimtex#imaps#wrap_environment',
  \ 'context' : [
  \      {'envs' : ["itemize", "enumerate"],
  \       'rhs' : '\item '},
  \      {'envs' : ["tabular", "tabularx"],
  \       'rhs' : "A\\\\\\hline"},
  \      {'envs' : ["document"],
  \       'rhs' : "A\\\\"},
  \ ],
  \})

"  vim sensible
"  clipboard
"  airline styles
"  vimagit
"  flog

"CoC Settings
" Use tab for trigger completion with characters ahead and navigate.
" NOTE: Use command ':verbose imap <tab>' to make sure tab is not mapped by
" other plugin before putting this into your config.
inoremap <silent><expr> <TAB>
      \ pumvisible() ? "\<C-n>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()
inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"

function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" Make <CR> to accept selected completion item or notify coc.nvim to format
" <C-g>u breaks current undo, please make your own choice.
inoremap <silent><expr> <CR> coc#pum#visible() ? coc#pum#confirm()
                              \: "\<C-g>u\<CR>\<c-r>=coc#on_enter()\<CR>"


" Mouse support
set mouse=a
set ttymouse=sgr
set balloonevalterm
" Styled and colored underline support
let &t_AU = "\e[58:5:%dm"
let &t_8u = "\e[58:2:%lu:%lu:%lum"
let &t_Us = "\e[4:2m"
let &t_Cs = "\e[4:3m"
let &t_ds = "\e[4:4m"
let &t_Ds = "\e[4:5m"
let &t_Ce = "\e[4:0m"
" Strikethrough
let &t_Ts = "\e[9m"
let &t_Te = "\e[29m"
" Truecolor support
let &t_8f = "\e[38:2:%lu:%lu:%lum"
let &t_8b = "\e[48:2:%lu:%lu:%lum"
let &t_RF = "\e]10;?\e\\"
let &t_RB = "\e]11;?\e\\"
" Bracketed paste
let &t_BE = "\e[?2004h"
let &t_BD = "\e[?2004l"
let &t_PS = "\e[200~"
let &t_PE = "\e[201~"
" Cursor control
let &t_RC = "\e[?12$p"
let &t_SH = "\e[%d q"
let &t_RS = "\eP$q q\e\\"
let &t_SI = "\e[5 q"
let &t_SR = "\e[3 q"
let &t_EI = "\e[1 q"
let &t_VS = "\e[?12l"
" Focus tracking
let &t_fe = "\e[?1004h"
let &t_fd = "\e[?1004l"
execute "set <FocusGained>=\<Esc>[I"
execute "set <FocusLost>=\<Esc>[O"
" Window title
let &t_ST = "\e[22;2t"
let &t_RT = "\e[23;2t"
