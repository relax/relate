<!DOCTYPE html>
<html>
<head>
  <meta charSet='utf-8' />
  <title>{{config.title + ' - ' + page.title}}</title>
  <link rel='icon' type='image/png' href='{{ url_for("images/logo.png") }}' />
  <link href='{{ url_for("css/bootstrap.min.css") }}' rel='stylesheet'>
  <link href='{{ url_for("css/docs.css") }}' rel='stylesheet'>
  <link href='{{ url_for("css/font-awesome.min.css") }}' rel='stylesheet'>
  <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,300,700' rel='stylesheet' type='text/css'>
</head>
<body>
  <div class='menu'>
    <div class='logo'>
      <img src='{{ url_for("images/logo.png") }}' />
      <span>Relate.js</span>
    </div>
    <nav class='menu-nav'>
      {% for section in site.data.nav %}
        <ul class='nav'>
          <span>{{ section.title }}</span>
          <ul class='nav'>
            {% for item in section.items %}
              <li>
                <a href='{{item.href || url_for(item.id + ".html") }}'{% if item.id == page.id %} class='active'{% endif %}>{{item.title}}</a>
              </li>
            {% endfor %}
          </ul>
        </ul>
      {% endfor %}
    </nav>
    <a class='footer' href='https://github.com/relax/relate'>
      <i class='fa fa-github'></i>
      <span>Project on github</span>
    </a>
  </div>
  <div class='page'>
    <div class='page-content'>
      <h1>{{page.title}}</h1>
      {{page.content}}
    </div>
  </div>
  <div class='switch-page'>
    {% if page.prev %}
      <a class='previous' href='{{ url_for(page.prev) }}'>
        <i class='fa fa-angle-left'></i>
        <span>Previous</span>
      </a>
    {% endif %}
    {% if page.next %}
      <a class='next' href='{{ url_for(page.next) }}'>
        <span>Next</span>
        <i class='fa fa-angle-right'></i>
      </a>
    {% endif %}
  </div>
</body>
</html>
