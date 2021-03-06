import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TodoList } from '@mlsk/todo/models';
import { TodoFacade } from '@mlsk/todo/state';
import { ChecklistData } from '@mlsk/ui';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, skip, startWith, takeUntil, tap } from 'rxjs/operators';
import { GlobalLoaderService } from '@mlsk/shared/loader';

// TODO: consider adding id to GlobalLoaderService by NgRx effects instead of explicit dependecy here
@Component({
  selector: 'mlsk-todolist-editor',
  templateUrl: './todolist-editor.component.html',
  styleUrls: ['./todolist-editor.component.scss']
})
export class TodoListEditorComponent implements OnInit, OnDestroy {
  _todoList: TodoList;
  @Input() set todoList(todoList: TodoList) {
    this._todoList = todoList;
    this.globalLoaderService?.pop(this.todoList.id)
    if (todoList.title !== this.todoName.value || !this.shouldEmit) {
      this.todoName.setValue(todoList.title, { emitEvent: this.shouldEmit });
      this.shouldEmit = true;
    }
  }
  get todoList() {
    return this._todoList;
  }

  onChangeSubject = new Subject<ChecklistData[]>();
  destroyed = new Subject<boolean>();
  todoName = new FormControl('');
  shouldEmit = false; // don't emit on first set up of input

  constructor(
    private todos: TodoFacade,
    @Optional() private globalLoaderService: GlobalLoaderService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.todoName.valueChanges.pipe(
        startWith(this.todoName.value),
      ),
      this.onChangeSubject.pipe(
        startWith(null),
      ),
    ])
    .pipe(
      skip(1),
      takeUntil(this.destroyed),
      tap(() => this.globalLoaderService?.push(this.todoList.id)),
      debounceTime(2000),
    ).subscribe(([name, data]) => {
      this.dispatchUpdate(name, data);
    });
  }

  dispatchUpdate(title: string, data: ChecklistData[]) {
    this.todos.update({
      ...this.todoList,
      title,
      items: data?.map((row, index) => ({
        order: index,
        title: row.text,
        completed: row.checked,
      })) || this.todoList.items,
    });
  }

  onDelete() {
    this.todos.delete(this.todoList);
  }

  onDataChange(data: ChecklistData[]) {
    this.onChangeSubject.next(data)
  }

  ngOnDestroy() {
    this.destroyed.next(true);
  }
}
