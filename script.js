// 1. Supabase credentials configuration
const { createClient } = supabase;
const SUPABASE_URL = "https://aworywayyxstysdaiqlx.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_QqFOGSypuY7yIbON6oAGvQ_SJfZ-rdi";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Fetch tasks from Supabase (Read)
async function fetchTasks() {
  const searchKeyword = document.getElementById("searchInput").value.trim();
  let query = db.from("tasks").select("*").order("id", { ascending: false });

  if (searchKeyword) {
    query = query.ilike("title", `%${searchKeyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  renderTable(data);
}

// 3. Render tasks into HTML table
function renderTable(tasks) {
  const tbody = document.getElementById("taskTableBody");
  tbody.innerHTML = "";

  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tasks found</td></tr>';
    return;
  }

  tasks.forEach(task => {
    const isDone = task.is_done;
    const statusBadge = isDone 
      ? '<span class="badge status-done">Done</span>' 
      : '<span class="badge status-pending">Pending</span>';
    
    const titleStyle = isDone ? 'class="title-done"' : '';
    const dueDate = task.due_date ? task.due_date : '-';

    const row = `
      <tr>
        <td>${task.id}</td>
        <td ${titleStyle}><strong>${task.title}</strong></td>
        <td>${dueDate}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-toggle" onclick="toggleTaskStatus(${task.id}, ${!isDone})">
            ${isDone ? 'Mark Pending' : 'Mark Done'}
          </button>
          <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// 4. Add new task (Create)
async function addTask(event) {
  event.preventDefault();
  const title = document.getElementById("newTitle").value;
  const dueDate = document.getElementById("newDueDate").value;

  const { error } = await db.from("tasks").insert([
    { 
      title: title, 
      due_date: dueDate || null, 
      is_done: false 
    }
  ]);

  if (error) {
    alert("Supabase Error: " + error.message + (error.hint ? "\nHint: " + error.hint : ""));
    console.error("Insert error:", error);
  } else {
    document.getElementById("addForm").reset();
    fetchTasks();
  }
}

// 5. Toggle completion status (Update)
async function toggleTaskStatus(id, newStatus) {
  const { error } = await db
    .from("tasks")
    .update({ is_done: newStatus })
    .eq("id", id);

  if (error) {
    alert("Update Error: " + error.message);
    console.error("Update error:", error);
  } else {
    fetchTasks();
  }
}

// 6. Delete a task (Delete)
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const { error } = await db.from("tasks").delete().eq("id", id);

  if (error) {
    alert("Delete Error: " + error.message);
    console.error("Delete error:", error);
  } else {
    fetchTasks();
  }
}

// Initial fetch on page load
fetchTasks();
